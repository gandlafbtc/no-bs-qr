<script lang="ts">
  import { onMount } from 'svelte';

  let deferredPrompt: any;
  let showInstallPrompt = false;

  onMount(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // App is already installed, don't show the prompt
      return;
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Save the event for later use
      deferredPrompt = e;
      // Show our custom install prompt
      showInstallPrompt = true;
    });
  });

  // Function to handle the install button click
  async function installApp() {
    if (!deferredPrompt) {
      return;
    }

    // Show the browser's install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Reset the deferred prompt variable
    deferredPrompt = null;
    
    // Hide our custom prompt
    showInstallPrompt = false;
  }

  // Function to dismiss the prompt
  function dismissPrompt() {
    showInstallPrompt = false;
  }
</script>

{#if showInstallPrompt}
  <div class="install-prompt fixed bottom-16 left-0 right-0 mx-auto w-11/12 max-w-md p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
    <div class="flex justify-between items-center">
      <div class="flex-1">
        <h3 class="text-lg font-semibold">Install No BS QR</h3>
        <p class="text-sm text-gray-600">Install this app on your device for quick access and offline use.</p>
      </div>
      <div class="flex gap-2">
        <button 
          on:click={dismissPrompt}
          class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Later
        </button>
        <button 
          on:click={installApp}
          class="px-3 py-1 text-sm bg-black text-white rounded-md hover:bg-gray-800"
        >
          Install
        </button>
      </div>
    </div>
  </div>
{/if}
