
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handle refresh 404 errors by redirecting to home page
// This helps with deployment platforms like Vercel that might not have the proper rewrite rules
if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/auth')) {
  const url = new URL(window.location.href);
  if (url.search) {
    window.location.href = `/${url.search}`;
  } else {
    window.location.href = '/';
  }
}

createRoot(document.getElementById("root")!).render(<App />);
