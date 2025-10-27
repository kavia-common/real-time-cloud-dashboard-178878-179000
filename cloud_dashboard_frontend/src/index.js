import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Explicitly unregister service workers to avoid no-op fetch handler warnings (CRA may register in some templates)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister().catch(() => {}));
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
