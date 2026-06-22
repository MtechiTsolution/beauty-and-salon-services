import App from '@/app/App';
import '@mit-salon/shared/styles/index.css';
import './customer-theme.css';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
