export default function Logo({ className = "h-8 w-8" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 32 32" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.8 }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.1"/>
      <path 
        d="M24 10H8V13L16 19L8 19V22H24V19L16 13L24 13V10Z" 
        fill="currentColor"
      />
      <circle 
        cx="16" 
        cy="16" 
        r="2" 
        fill="currentColor" 
        fillOpacity="0.8"
      />
    </svg>
  );
} 