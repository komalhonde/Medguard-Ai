import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Filter out benign Vite HMR websocket reconnection noise in sandboxed preview iframe
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason?.message?.includes?.('WebSocket') ||
      event.reason?.toString?.().includes?.('WebSocket') ||
      event.reason?.message?.includes?.('vite')
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

