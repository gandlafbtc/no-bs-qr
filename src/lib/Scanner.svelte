<script lang="ts">
	import QrScanner from 'qr-scanner';
	import { onDestroy, onMount } from 'svelte';
	import { URDecoder } from '@gandlaf21/bc-ur';
	import { Scan } from "lucide-svelte";
    import { toast } from './helper';

	let videoElem: HTMLVideoElement | undefined = $state();
	let qrScanner: QrScanner | undefined = $state();
	let cams: QrScanner.Camera[] | undefined = $state();

	let facingMode: QrScanner.FacingMode = 'environment';

	let completion = $state(0);

	let scanProcess = '';

	let decoder: URDecoder;

	let nativeInterval: number | undefined;

	let {scanned = $bindable("")}: {scanned:string} = $props()

	onMount(async () => {
		decoder = new URDecoder();
		if (!videoElem) {
			console.error('video element not present');
			return;
		}
		
		if (await QrScanner.hasCamera()) {
			qrScanner = new QrScanner(
				videoElem,
				(result) => {
					onScanSuccess(result);
				},
				{
					/* your options or returnDetailedScanResult: true if you're not specifying any other options */
				}
			);
			qrScanner.start();
			cams = await QrScanner.listCameras(true);
			if (cams.length > 1) {
				qrScanner.setCamera(facingMode);
			}
		} else {
			cams = [];
		}
	});

	onDestroy(() => {
		if (qrScanner) {
			qrScanner.destroy();
		}
		if (nativeInterval) {
			clearInterval(nativeInterval);
		}
	});

	const onScanSuccess = (result: QrScanner.ScanResult) => {
		if (result.data.startsWith('ur:')) {
			const chunkProcess = result.data.split('/')[1].split('-')[1];
			if (scanProcess && scanProcess !== chunkProcess) {
				decoder = new URDecoder();
			}
			scanProcess = chunkProcess;
			decoder.receivePart(result.data);
			completion = Math.floor(decoder.estimatedPercentComplete() * 100);
			if (!decoder.isComplete()) {
				return;
			}
			if (!decoder.isSuccess()) {
				throw new Error(`${decoder.resultError()}`);
			}
			const ur = decoder.resultUR();
			const decoded = ur.decodeCBOR();
			const scannedToken = decoded.toString();
			completeScan(scannedToken)
		} else {
         completeScan(result.data)
        }
			
	};

    const completeScan = (scannedResult: string) => {
		scanned = scannedResult
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
			<video bind:this={videoElem} width="100%" height="auto" class="video-container"> </video>
		</div>

		<div class="absolute right-5 top-5 z-10 h-10 w-10">
			{#if (cams?.length ?? 0) > 1}
				<button
					class=""
					onclick={async () => {
						await qrScanner?.setCamera(facingMode);
						qrScanner?.stop();
						qrScanner?.start();
					}}
				>
					switch cam
				</button>
			{/if}
		</div>

		<div class="absolute z-10 h-56 w-56 opacity-30">
			<Scan color="white" size={220} strokeWidth={1}></Scan>
		</div>
	</div>
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
