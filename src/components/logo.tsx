import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
 <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 70"
    width="100"
    height="70"
    {...props}
 >
    <g fill="none" strokeWidth="3">
      {/* Buildings in Gray */}
      <g stroke="#808080">
        {/* Tallest Building */}
        <path d="M50 15 L 50 5 L 45 5 L 45 15" strokeLinecap="round" />
        <path d="M40 50 L 40 15 L 60 15 L 60 50 Z" />
        <circle cx="55" cy="20" r="1.5" fill="#808080" stroke="none" />
        <circle cx="55" cy="27" r="1.5" fill="#808080" stroke="none" />
        <circle cx="55" cy="34" r="1.5" fill="#808080" stroke="none" />
        <circle cx="55" cy="41" r="1.5" fill="#808080" stroke="none" />

        {/* Left Building */}
        <path d="M25 50 L 25 30 L 40 30" />
        <path d="M20 50 L 20 35 L 40 35" />
        <circle cx="28" cy="40" r="1.5" fill="#808080" stroke="none" />
        <circle cx="35" cy="40" r="1.5" fill="#808080" stroke="none" />
        <circle cx="28" cy="45" r="1.5" fill="#808080" stroke="none" />
        <circle cx="35" cy="45" r="1.5" fill="#808080" stroke="none" />


        {/* Right Building */}
        <path d="M60 30 L 80 30 L 80 50" />
        <path d="M60 25 L 75 25" />
        <path d="M60 35 L 75 35" />
        <path d="M60 45 L 75 45" />

        <path d="M75 30 L 75 25" />
        <path d="M75 35 L 75 30" />
        <path d="M75 45 L 75 35" />
      </g>
      
      {/* Text in Blue */}
      <g stroke="#4682B4" fill="#4682B4">
        <text x="10" y="65" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="18">
          sindi.club
        </text>
      </g>
    </g>
 </svg>
);

export default Logo;
