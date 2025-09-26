<script>
    import AnimQR from "$lib/AnimQR.svelte";
    let inputVal = $state('');
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
            <AnimQR token={inputVal} speed={5} size={5}></AnimQR>
        </div>
</div>
