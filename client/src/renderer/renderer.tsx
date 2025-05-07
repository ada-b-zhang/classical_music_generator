import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    const container = document.getElementById('app');
    if (!container) {
      throw new Error('Root element not found');
    }
    
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render React application:', error);
  }
}); 