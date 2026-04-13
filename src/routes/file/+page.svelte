<script lang="ts">
    import { copyTextToClipboard, toast } from "$lib/helper";
    import decodeQR from "qr/decode.js";
    import { onMount } from "svelte";

    let scannedResult = $state("");
    let isDragging = $state(false);
    let fileInputRef: HTMLInputElement;

    // Decode QR from image using canvas and qr library
    async function decodeQRFromImage(imageBlob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    // Create canvas and draw image
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    
                    if (!ctx) {
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }
                    
                    ctx.drawImage(img, 0, 0);
                    
                    // Extract bitmap data
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    // Decode with qr library
                    const result = decodeQR({
                        width: imageData.width,
                        height: imageData.height,
                        data: imageData.data
                    });
                    
                    URL.revokeObjectURL(img.src);
                    resolve(result);
                } catch (error) {
                    URL.revokeObjectURL(img.src);
                    reject(error);
                }
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                reject(new Error('Failed to load image'));
            };
            
            img.src = URL.createObjectURL(imageBlob);
        });
    }

    // Handle paste from clipboard
    async function handlePaste(event: ClipboardEvent) {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            if (item.type.startsWith('image/')) {
                event.preventDefault();
                const blob = item.getAsFile();
                
                if (blob) {
                    try {
                        const result = await decodeQRFromImage(blob);
                        scannedResult = result;
                        toast.info("QR code decoded!");
                    } catch (error) {
                        console.error("Error decoding QR:", error);
                        toast.error("Failed to decode QR code from pasted image");
                    }
                }
                break;
            }
        }
    }

    // Handle paste button click
    async function handlePasteButton() {
        try {
            const clipboardItems = await navigator.clipboard.read();
            
            for (const item of clipboardItems) {
                for (const type of item.types) {
                    if (type.startsWith('image/')) {
                        const blob = await item.getType(type);
                        const result = await decodeQRFromImage(blob);
                        scannedResult = result;
                        toast.info("QR code decoded!");
                        return;
                    }
                }
            }
            
            toast.error("No image found in clipboard");
        } catch (error) {
            console.error("Error reading clipboard:", error);
            toast.error("Failed to read clipboard. Please use Ctrl+V or drag & drop.");
        }
    }

    // Handle file selection
    async function handleFileSelect(file: File) {
        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a PNG or JPEG image");
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error("File size must be less than 5MB");
            return;
        }

        try {
            const result = await decodeQRFromImage(file);
            scannedResult = result;
            toast.info("QR code decoded!");
        } catch (error) {
            console.error("Error decoding QR:", error);
            toast.error("Failed to decode QR code");
        }
    }

    // Handle drag events
    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        isDragging = true;
    }

    function handleDragLeave(event: DragEvent) {
        event.preventDefault();
        isDragging = false;
    }

    async function handleDrop(event: DragEvent) {
        event.preventDefault();
        isDragging = false;

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            await handleFileSelect(files[0]);
        }
    }

    // Handle file input change
    function handleFileInputChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    }

    // Add paste event listener on mount
    onMount(() => {
        window.addEventListener('paste', handlePaste);
        
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    });
</script>

<div class="flex w-full min-h-screen items-center justify-center p-2">
        
    {#if scannedResult}
        <div class="flex flex-col gap-3">
            <div class="w-80 break-all p-2 border border-dashed rounded-lg">
                <p>
                    {scannedResult}
                </p>
                <button
                    class="cursor-pointer p-2 rounded-md bg-black text-white hover:opacity-100 opacity-80"
                    onclick={() => {
                        copyTextToClipboard(scannedResult)
                        toast.info("copied!");
                    }}
                >
                    Copy
                </button>
            </div>

            <button
                class="cursor-pointer p-2 w-80 rounded-md bg-black text-white hover:opacity-100 opacity-80"
                onclick={() => {
                    scannedResult = "";
                }}
            >
                Start new scan</button
            >
        </div>
    {:else}
        <div class="min-h-80 h-full w-full max-w-80 flex flex-col gap-3">
            <!-- Hidden file input -->
            <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                bind:this={fileInputRef}
                onchange={handleFileInputChange}
                class="hidden"
            />
            
            <!-- Custom dropzone -->
            <div
                role="button"
                tabindex="0"
                class="h-full min-h-80 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors {isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}"
                ondragover={handleDragOver}
                ondragleave={handleDragLeave}
                ondrop={handleDrop}
                onclick={() => fileInputRef?.click()}
                onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef?.click();
                    }
                }}
            >
                <div class="flex flex-col items-center gap-2 p-4 text-center">
                    <p>Click here or drag and drop an image to scan</p>
                    <p class="text-sm opacity-70">or press Ctrl+V to paste</p>
                </div>
            </div>
            
            <button
                class="cursor-pointer p-3 rounded-md bg-black text-white hover:opacity-100 opacity-80"
                onclick={handlePasteButton}
            >
                📋 Paste Image from Clipboard
            </button>
        </div>
    {/if}
</div>
