/** @type {import('@sveltejs/kit').HandleClientError} */
export async function handleError({ error, event }) {
  console.error('An error occurred:', error);
  return {
    message: 'An unexpected error occurred. Please try again later.'
  };
}

// Register service worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service worker registered:', registration);
      })
      .catch(error => {
        console.error('Service worker registration failed:', error);
      });
  });
}
