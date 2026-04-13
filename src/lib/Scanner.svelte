<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import decodeQR from 'qr/decode.js';
	import { URDecoder } from '@gandlaf21/bc-ur';
	import { Scan } from "lucide-svelte";
    import { toast } from './helper';

	let videoElem: HTMLVideoElement | undefined = $state();
	let canvasElem: HTMLCanvasElement | undefined = $state();
	let stream: MediaStream | null = null;
	let animFrameId: number;
	let cams: MediaDeviceInfo[] | undefined = $state();

	let facingMode: 'user' | 'environment' = 'environment';
	let scanning = $state(true);
	let error = $state('');

	let completion = $state(0);
	let scanProcess = '';
	let decoder: URDecoder;

	let {scanned = $bindable("")}: {scanned:string} = $props()

	onMount(async () => {
		decoder = new URDecoder();
		await startCamera();
	});

	onDestroy(() => {
		stopCamera();
	});

	async function startCamera() {
		error = '';
		try {
			// Get list of cameras
			const devices = await navigator.mediaDevices.enumerateDevices();
			cams = devices.filter(device => device.kind === 'videoinput');

			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } }
			});
			
			if (videoElem) {
				videoElem.srcObject = stream;
				await videoElem.play();
				scanning = true;
				requestScan();
			}
		} catch (e) {
			error = 'Could not access camera. Please allow camera permissions.';
			console.error(e);
			cams = [];
		}
	}

	function stopCamera() {
		scanning = false;
		if (animFrameId) {
			cancelAnimationFrame(animFrameId);
		}
		if (stream) {
			stream.getTracks().forEach((t) => t.stop());
			stream = null;
		}
	}

	function requestScan() {
		if (!scanning) return;
		animFrameId = requestAnimationFrame(scanFrame);
	}

	function scanFrame() {
		if (!scanning || !videoElem || !canvasElem || videoElem.readyState !== videoElem.HAVE_ENOUGH_DATA) {
			requestScan();
			return;
		}

		const width = videoElem.videoWidth;
		const height = videoElem.videoHeight;

		if (width === 0 || height === 0) {
			requestScan();
			return;
		}

		canvasElem.width = width;
		canvasElem.height = height;

		const ctx = canvasElem.getContext('2d', { willReadFrequently: true });
		if (!ctx) {
			requestScan();
			return;
		}

		ctx.drawImage(videoElem, 0, 0, width, height);
		const imageData = ctx.getImageData(0, 0, width, height);

		try {
			const decoded = decodeQR({ width, height, data: imageData.data });
			if (decoded) {
				if (decoded.startsWith('ur:')) {
					// Extract sequence ID from UR format: ur:crypto-psbt/1-5/lpcfamhyaocsfncywszswlmwhdckdwglchcwhdgrflahamhybbhpfpgrcabwfdgaaoadasfxaeayflbabacfgebnnecwjecx
					// The format is: ur:type/currentIndex-totalParts/data
					// We want to track the totalParts to detect if it's a new sequence
					const parts = decoded.split('/');
					if (parts.length >= 2) {
						const indexPart = parts[1]; // e.g., "1-5"
						const totalParts = indexPart.split('-')[1]; // e.g., "5"
						
						// Only reset if we detect a different total parts count (new sequence)
						if (scanProcess && scanProcess !== totalParts) {
							decoder = new URDecoder();
						}
						scanProcess = totalParts;
					}
					
					decoder.receivePart(decoded);
					completion = Math.floor(decoder.estimatedPercentComplete() * 100);
					if (!decoder.isComplete()) {
						requestScan();
						return;
					}
					if (!decoder.isSuccess()) {
						throw new Error(`${decoder.resultError()}`);
					}
					const ur = decoder.resultUR();
					const decodedUR = ur.decodeCBOR();
					const scannedToken = decodedUR.toString();
					completeScan(scannedToken);
					// Stop scanning after successful UR decode
					scanning = false;
					return;
				} else {
					completeScan(decoded);
					// Continue scanning for regular QR codes
					requestScan();
					return;
				}
			}
		} catch (e) {
			// No QR found in this frame, continue scanning
		}
		requestScan();
	}

	async function switchCamera() {
		facingMode = facingMode === 'environment' ? 'user' : 'environment';
		stopCamera();
		await startCamera();
	}

    const completeScan = (scannedResult: string) => {
		scanned = scannedResult;
		// Don't stop scanning, allow continuous scanning
		// scanning = false;
    }

</script>
<div class="flex min-h-96 w-full flex-col items-center justify-center">
	<div class="h-10 w-80 ">
		{#if completion}
			<progress value={completion - 5} max={100} class="w-full"></progress>
		{/if}
	</div>
	<div class="relative flex h-full w-80 items-center justify-center ">
		<div class="video-wrapper h-80 w-80 rounded-lg border bg-black p-2">
			{#if cams === undefined}
				loading cam
			{:else if cams?.length === 0}
				no cam found
			{/if}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video bind:this={videoElem} width="100%" height="auto" class="video-container" playsinline autoplay muted> </video>
		</div>

		<div class="absolute right-5 top-5 z-10 h-10 w-10">
			{#if (cams?.length ?? 0) > 1}
				<button
					class=""
					onclick={switchCamera}
				>
					switch cam
				</button>
			{/if}
		</div>

		<div class="absolute z-10 h-56 w-56 opacity-30">
			<Scan color="white" size={220} strokeWidth={1}></Scan>
		</div>
	</div>
	
	<canvas bind:this={canvasElem} class="hidden"></canvas>
</div>
{scanned}
<style>
	.video-container {
		object-fit: cover;
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}
	.video-wrapper {
		/* Telling our absolute positioned video to 
  be relative to this element */
		position: relative;

		/* Will not allow the video to overflow the 
  container */
		overflow: hidden;

		/* Centering the container's content vertically 
  and horizontally */
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
