<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
    import { page } from '$app/state';
	let { children } = $props();
</script>

<div class="shadow-2xl gap-5 items-center flex justify-center fixed top-0 w-full h-20">
	<a href="/"  class="rounded-md p-2 opacity-80 hover:opacity-100 font-bold transition-all hover:bg-gray-700 hover:text-white {page.url.pathname === '/' ?"text-white bg-black":""}">QR</a>
	<a href="/animated" class="rounded-md p-2 opacity-80 hover:opacity-100 font-bold transition-all hover:bg-gray-700 hover:text-white {page.url.pathname === '/animated' ?"text-white bg-black":""}">Animated QR</a>
	<a href="/scan"  class="rounded-md p-2 opacity-80 hover:opacity-100 font-bold transition-all hover:bg-gray-700 hover:text-white {page.url.pathname === '/scan' ?"text-white bg-black":""}">Scan</a>
</div>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>No bullshit QR</title>
</svelte:head>

{@render children?.()}

<footer class="fixed bottom-0 w-full py-3 text-center text-sm text-gray-600 bg-white bg-opacity-80 shadow-md">
	<div class="flex justify-center gap-4">
		<a href="https://github.com/gandlafbtc/no-bs-qr.git" target="_blank" rel="noopener noreferrer" class="hover:text-black transition-colors">
			GitHub
		</a>
		<span>|</span>
		<a href="https://gandlaf.com" target="_blank" rel="noopener noreferrer" class="hover:text-black transition-colors">
			gandlaf.com
		</a>
	</div>
</footer>
