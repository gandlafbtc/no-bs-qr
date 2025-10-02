<script lang="ts">
    import { toast } from "$lib/helper";
    import QrScanner from "qr-scanner";
    import Dropzone from "svelte-file-dropzone";

    let file = $state("");
    let scannedResult = $state("");
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
        <div class="min-h-80 h-full w-full max-w-80">
            <Dropzone
                containerClasses="h-full min-h-80"
                accept=".png,.jpg,.jpeg"
                multiple={false}
                maxSize={1024 * 1024 * 5}
                on:drop={async (e) => {
                    const uploadedFile = e.detail.acceptedFiles[0];

                    file = URL.createObjectURL(uploadedFile);
                    const blob = await (await fetch(file)).blob();

                    try {
                        // Decode QR from the file
                        const result = await QrScanner.scanImage(blob, {});
                        scannedResult = result;
                    } catch (error) {
                        console.error("Error decoding QR:", error);
                        toast.error("Failed to decode QR code");
                    }
                }}
            >
                Click here or drag and drop an image to scan
            </Dropzone>
        </div>
    {/if}
</div>
