import React from "react";

export default function Navbar() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="logo">
          {/* Shield Checkmark brand logo matching the image theme */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-accent"
          >
            {/* Left Pixelated motion lines */}
            <rect x="5" y="38" width="12" height="4" rx="1" fill="#00F5D4" />
            <rect x="10" y="46" width="15" height="4" rx="1" fill="#00F5D4" />
            <rect x="15" y="54" width="18" height="4" rx="1" fill="#0077B6" />
            <rect x="22" y="62" width="10" height="4" rx="1" fill="#0077B6" />

            {/* Shield Outline with Blue-to-Teal Gradient */}
            <path
              d="M50 85C50 85 28 70 28 45V22L50 12L72 22V45C72 70 50 85 50 85Z"
              stroke="url(#shieldGrad)"
              strokeWidth="6"
              strokeLinejoin="round"
              fill="#0B0E11"
            />
            {/* Magnifying Glass (Outer Circle) */}
            <circle
              cx="50"
              cy="42"
              r="16"
              stroke="url(#shieldGrad)"
              strokeWidth="5"
            />
            {/* Magnifying Glass Handle */}
            <line
              x1="61.5"
              y1="53.5"
              x2="72"
              y2="64"
              stroke="url(#shieldGrad)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Checkmark inside Circle */}
            <path
              d="M44 42L48 46L57 37"
              stroke="#00F5D4"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Code symbol < /> below */}
            <path
              d="M42 66L38 69L42 72"
              stroke="#0077B6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M58 66L62 69L58 72"
              stroke="#0077B6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M52 65L48 73"
              stroke="#0077B6"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <defs>
              <linearGradient id="shieldGrad" x1="28" y1="12" x2="72" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00F5D4" />
                <stop offset="50%" stopColor="#00B4D8" />
                <stop offset="100%" stopColor="#0077B6" />
              </linearGradient>
            </defs>
          </svg>
          <span>devaudit</span>
        </div>
        <nav className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#report">Sample report</a>
        </nav>
        <a href="#" className="nav-cta">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.4-5.25 5.69.42.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
          </svg>
          Connect repo
        </a>
      </div>
    </header>
  );
}
