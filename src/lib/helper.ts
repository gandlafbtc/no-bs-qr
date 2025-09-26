interface ToastOptions {
    duration?: number;
    x?: number;
    y?: number;
    type?: 'info' | 'error' | 'warning' | 'success';
}

export const toast = {
    show(message: string, options: ToastOptions = {}) {
        const { 
            duration = 2000, 
            x = window.innerWidth / 2, 
            y = window.innerHeight / 2,
            type = 'info'
        } = options;

        // Create toast element
        const toastEl = document.createElement('div');
        toastEl.textContent = message;
        toastEl.style.position = 'fixed';
        toastEl.style.left = `${x}px`;
        toastEl.style.top = `${y}px`;
        toastEl.style.transform = 'translate(-50%, -50%)';
        toastEl.style.padding = '8px 12px';
        toastEl.style.borderRadius = '4px';
        toastEl.style.fontSize = '14px';
        toastEl.style.fontWeight = '500';
        toastEl.style.zIndex = '9999';
        toastEl.style.pointerEvents = 'none';
        toastEl.style.transition = 'opacity 0.2s ease-in-out';
        
        // Set style based on type
        switch (type) {
            case 'info':
                toastEl.style.backgroundColor = 'rgba(0, 122, 255, 0.9)';
                toastEl.style.color = 'white';
                break;
            case 'error':
                toastEl.style.backgroundColor = 'rgba(255, 59, 48, 0.9)';
                toastEl.style.color = 'white';
                break;
            case 'warning':
                toastEl.style.backgroundColor = 'rgba(255, 204, 0, 0.9)';
                toastEl.style.color = 'black';
                break;
            case 'success':
                toastEl.style.backgroundColor = 'rgba(52, 199, 89, 0.9)';
                toastEl.style.color = 'white';
                break;
        }

        // Add to DOM
        document.body.appendChild(toastEl);
        
        // Animate in
        toastEl.style.opacity = '0';
        setTimeout(() => {
            toastEl.style.opacity = '1';
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            toastEl.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toastEl);
            }, 200);
        }, duration);
    },
    
    info(message: string, options: Omit<ToastOptions, 'type'> = {}) {
        this.show(message, { ...options, type: 'info' });
    },
    
    error(message: string, options: Omit<ToastOptions, 'type'> = {}) {
        this.show(message, { ...options, type: 'error' });
    },
    
    warning(message: string, options: Omit<ToastOptions, 'type'> = {}) {
        this.show(message, { ...options, type: 'warning' });
    },
    
    success(message: string, options: Omit<ToastOptions, 'type'> = {}) {
        this.show(message, { ...options, type: 'success' });
    },
    
    // Show toast at pointer event location
    at(event: MouseEvent | TouchEvent, message: string, options: Omit<ToastOptions, 'x' | 'y'> = {}) {
        let x, y;
        
        if (event instanceof MouseEvent) {
            x = event.clientX;
            y = event.clientY;
        } else if (event instanceof TouchEvent && event.touches.length > 0) {
            x = event.touches[0].clientX;
            y = event.touches[0].clientY;
        } else {
            // Fallback to center of screen
            x = window.innerWidth / 2;
            y = window.innerHeight / 2;
        }
        
        this.show(message, { ...options, x, y });
    }
};

function fallbackCopyTextToClipboard(text: string) {
       var textArea = document.createElement('textarea');
       textArea.value = text;

       // Avoid scrolling to bottom
       textArea.style.top = '0';
       textArea.style.left = '0';
       textArea.style.position = 'fixed';

       document.body.appendChild(textArea);
       textArea.focus();
       textArea.select();

       try {
               var successful = document.execCommand('copy');
               if (successful) {
                       toast.info('copied!');
               }
       } catch (err) {
               console.error('Fallback: Oops, unable to copy', err);
       }

       document.body.removeChild(textArea);
}
export function copyTextToClipboard(text: string) {
       if (!navigator.clipboard) {
               fallbackCopyTextToClipboard(text);
               return;
       }
       navigator.clipboard.writeText(text).then(
               function () {
                       toast.info('copied!');
               },
               function (err) {
                       console.error('Async: Could not copy text: ', err);
               }
       );
}
