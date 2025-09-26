<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Buffer } from 'buffer';
	import { UREncoder, UR } from '@gandlaf21/bc-ur';
    import encodeQR from 'qr';

	let { token, speed, size }: { token: string; speed: number; size: number } = $props();

	let chunk = $state('');
	let maxFragmentLength = $derived(size * 50);
	let intervalMS = $derived(1000 / speed);
	const firstSeqNum = 0;
	let encoder: UREncoder;

	let qrInterval: number | undefined;


	$effect(() => {
		if (intervalMS || maxFragmentLength) {
			doInterval();
		}
	});

	const doInterval = () => {
		const ur = UR.fromBuffer(Buffer.from(token));
		encoder = new UREncoder(ur, maxFragmentLength, firstSeqNum);
		clearInterval(qrInterval);
		qrInterval = setInterval(() => {
			chunk = encoder.nextPart();
		}, intervalMS);
	};

	onMount(() => {
		doInterval();
	});
	onDestroy(() => {
		clearInterval(qrInterval);
	});
	
</script>
{#if chunk && size && speed}
	<div class="flex flex-col gap-2">
		<div class="min-h-20 min-w-20 rounded-md bg-white p-1">
        {@html encodeQR(chunk, 'svg')}
    </div>

					<div
						class="flex flex-col gap-4 py-2 pr-3
			"
					>
					<div class="flex gap-2">
						<span>speed</span>
						 <input type="range"  bind:value={speed} max={10} min={1} step={1} />
					</div>
					<div class="flex gap-2">
						<span class="w-12">size</span>
						 <input type="range"  bind:value={size} max={10} min={1} step={1} />
					</div>
					</div>
	</div>
{/if}
