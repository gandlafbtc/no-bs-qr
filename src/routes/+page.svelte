<script>
    import encodeQR from "qr";

    let inputVal = $state("");
    
    const createQR = () => {
        let svg = encodeQR(inputVal, "svg");
        
        // Find where the SVG element starts
        const svgStartIndex = svg.indexOf("<svg");
        if (svgStartIndex !== -1) {
            // Find where the content after the svg tag starts
            const contentStartIndex = svg.indexOf(">", svgStartIndex) + 1;
            if (contentStartIndex !== 0) {
                // Extract viewBox to determine size
                const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
                let width = 100;
                let height = 100;
                
                if (viewBoxMatch && viewBoxMatch[1]) {
                    const viewBoxValues = viewBoxMatch[1].split(" ");
                    if (viewBoxValues.length >= 4) {
                        width = parseFloat(viewBoxValues[2]);
                        height = parseFloat(viewBoxValues[3]);
                    }
                }
                
                // Insert a white rectangle as the first element after the svg tag
                const whiteRect = `<rect width="${width}" height="${height}" fill="white"/>`;
                svg = svg.slice(0, contentStartIndex) + whiteRect + svg.slice(contentStartIndex);
            }
        }
        
        return svg;
    };

    let updatedSVG = $derived.by(createQR);
    
    let downloadQR = () => {
        // Convert SVG string to a Blob
        const blob = new Blob([updatedSVG], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "qr_code.svg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
</script>
<div class="w-screen h-screen flex flex-col items-center justify-center">
    <h1 class="text-3xl font-bold">
        No BS
    </h1>
    <h2 class="text-xl mb-4">
        Just QR
    </h2>
    <input type="text" bind:value={inputVal} class="border p-2 mb-4 w-64">
    <div>
    </div>
        <div class="mb-4 w-80 h-80">
            {@html updatedSVG}
        </div>
        <button onclick={downloadQR} class="bg-blue-500 text-white p-2 rounded">
            Download QR Code
        </button>
</div>
