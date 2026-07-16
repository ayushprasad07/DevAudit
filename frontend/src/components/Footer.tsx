import React from "react";

export default function Footer() {
  return (
    <footer>
      <div className="wrap footer-inner">
        <div className="logo">
          {/* Logo element matches checkmark-shield brand colors */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: "4px" }}
          >
            <path
              d="M50 85C50 85 28 70 28 45V22L50 12L72 22V45C72 70 50 85 50 85Z"
              stroke="url(#footerShieldGrad)"
              strokeWidth="6"
              strokeLinejoin="round"
              fill="#0B0E11"
            />
            <circle
              cx="50"
              cy="42"
              r="16"
              stroke="url(#footerShieldGrad)"
              strokeWidth="5"
            />
            <line
              x1="61.5"
              y1="53.5"
              x2="72"
              y2="64"
              stroke="url(#footerShieldGrad)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M44 42L48 46L57 37"
              stroke="#00F5D4"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="footerShieldGrad" x1="28" y1="12" x2="72" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00F5D4" />
                <stop offset="100%" stopColor="#0077B6" />
              </linearGradient>
            </defs>
          </svg>
          <span>devaudit</span>
        </div>
        <div className="footer-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#report">Sample report</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
