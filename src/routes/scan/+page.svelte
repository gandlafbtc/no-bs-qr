<script lang="ts">
    import { toast } from "$lib/helper";
    import Scanner from "$lib/Scanner.svelte";
	const DEFAULT_DATA = "Nothing scanned yet"
	let scanned = $state(DEFAULT_DATA)
</script>
<div class="flex items-center justify-center h-screen w-screen">

{#if scanned}
<div class="flex flex-col gap-3">
	<div class="w-80 break-all p-2 border border-dashed rounded-lg">
		<p>

			{scanned}
		</p>
		<button class="cursor-pointer p-2  rounded-md bg-black text-white hover:opacity-100 opacity-80" onclick={()=> {
			toast.info("copied!")
		}}>
	Copy	
	</button>
	</div>
	
	<button class="cursor-pointer p-2 w-80 rounded-md bg-black text-white hover:opacity-100 opacity-80" onclick={()=>{
		scanned=""
	}}> start new scan</button>
</div>
{:else}
<div class="flex flex-col gap-3">
	<Scanner bind:scanned></Scanner>
	<button class="cursor-pointer p-2 w-80 rounded-md bg-black text-white hover:opacity-100 opacity-80" onclick={()=>{
		scanned=DEFAULT_DATA
	}}> Abort scan</button>
	</div>
{/if}
</div>