import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/retro.css';
import App from './App';

// Disable service worker registration by ensuring no register calls exist.
// CRA will skip workbox PWA injection if no service worker registration is used.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
