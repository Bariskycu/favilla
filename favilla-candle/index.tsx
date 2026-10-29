import React from 'react';
import { HelmetProvider as HelmetProviderBase } from 'react-helmet-async';
const HelmetProvider = HelmetProviderBase as React.ComponentType<React.PropsWithChildren<{}>>;
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './i18n'; // Initialize i18n
import './index.css';


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);