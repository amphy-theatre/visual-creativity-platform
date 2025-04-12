
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handle refresh 404 errors by redirecting to home page
// This helps with deployment platforms like Vercel that might not have the proper rewrite rules
if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/auth')) {
  // Check if this is a page refresh (not an initial page load or navigation)
  const isRefresh = window.performance
    ?.getEntriesByType('navigation')
    ?.some((nav) => (nav as any).type === 'reload');

  // Only redirect if it's a refresh
  if (isRefresh) {
    console.log('Refresh detected on non-home route. Redirecting to homepage...');
    window.location.href = '/';
  }
}

createRoot(document.getElementById("root")!).render(<App />);
