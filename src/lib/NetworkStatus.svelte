<script lang="ts">
  import { onMount } from 'svelte';
  
  let isOnline = true;
  let showStatus = false;
  let statusTimeout: ReturnType<typeof setTimeout>;
  
  function updateOnlineStatus() {
    const wasOnline = isOnline;
    isOnline = navigator.onLine;
    
    // Only show the status notification when the status changes
    if (wasOnline !== isOnline) {
      showStatus = true;
      
      // Clear any existing timeout
      if (statusTimeout) {
        clearTimeout(statusTimeout);
      }
      
      // Hide the notification after 3 seconds
      statusTimeout = setTimeout(() => {
        showStatus = false;
      }, 3000);
    }
  }
  
  onMount(() => {
    // Set initial status
    isOnline = navigator.onLine;
    
    // Add event listeners for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Clean up event listeners on component destruction
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (statusTimeout) {
        clearTimeout(statusTimeout);
      }
    };
  });
</script>

{#if showStatus}
  <div 
    class="fixed top-24 right-4 p-3 rounded-md shadow-md z-50 transition-all duration-300 {isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}"
    role="status"
    aria-live="polite"
  >
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 rounded-full {isOnline ? 'bg-green-500' : 'bg-red-500'}"></div>
      <span class="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  </div>
{/if}
