import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import App from './App';

import { LanguageProvider } from './context/LanguageContext';

const convex = new ConvexReactClient(process.env.REACT_APP_CONVEX_URL || 'https://placeholder.convex.cloud');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ConvexAuthProvider>
  </React.StrictMode>
);
