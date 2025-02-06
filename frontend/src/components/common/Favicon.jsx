import { useEffect } from 'react';

export default function Favicon() {
  useEffect(() => {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/svg+xml';
    // Modern Z design for Zemon with gradient
    favicon.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:%234f46e5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:%236366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(%23grad)"/>
      <path d="M24 10H8V13L16 19L8 19V22H24V19L16 13L24 13V10Z" fill="white"/>
      <circle cx="16" cy="16" r="2" fill="white" fill-opacity="0.8"/>
    </svg>`;
    
    // Remove existing favicons
    const existingFavicons = document.querySelectorAll('link[rel="icon"]');
    existingFavicons.forEach(favicon => favicon.remove());
    
    document.head.appendChild(favicon);

    // Update document title
    document.title = 'Zemon 2.0';
    
    return () => {
      document.head.removeChild(favicon);
    };
  }, []);

  return null;
} 