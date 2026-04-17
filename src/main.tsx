import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
const bootScreen = document.getElementById('boot-screen');

window.setTimeout(() => {
  document.body.style.background = '#0a0b10';

  if (bootScreen) {
    bootScreen.remove();
  }

  createRoot(rootElement!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}, 1200);
