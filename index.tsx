
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import SeedApp from './components/SeedApp';
import VoiceApp from './VoiceApp';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Simple Router based on Query Params
const getApp = () => {
  const params = new URLSearchParams(window.location.search);
  const appMode = params.get('app');

  if (appMode === 'seed') return <SeedApp />;
  if (appMode === 'voice') return <VoiceApp />;
  return <App />;
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {getApp()}
  </React.StrictMode>
);
