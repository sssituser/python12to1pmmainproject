// Lightweight React Icons replacement to eliminate 1,378 KiB bundle
import React from 'react';

// HackerRank-style Course Symbols
// Create ultra-minimal geometric symbols

// HackerRank Python Symbol - Simple geometric design
export const FaPython = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <path d="M8 12h8M8 8h8M8 16h4" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// HackerRank JavaScript Symbol
export const FaJs = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <text x="12" y="15" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#F59E0B">JS</text>
  </svg>
);

// HackerRank Java Symbol
export const FaJava = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <circle cx="12" cy="12" r="4" fill="#EF4444"/>
    <rect x="10" y="10" width="4" height="4" fill="#1F2937"/>
  </svg>
);

// HackerRank Database Symbol
export const FaDatabase = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <ellipse cx="12" cy="10" rx="4" ry="2" fill="#3B82F6"/>
    <ellipse cx="12" cy="14" rx="4" ry="2" fill="#3B82F6"/>
  </svg>
);

// HackerRank Microsoft Symbol
export const FaMicrosoft = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="8" y="8" width="3" height="3" fill="#00BCF2"/>
    <rect x="13" y="8" width="3" height="3" fill="#F25022"/>
    <rect x="8" y="13" width="3" height="3" fill="#7FBA00"/>
    <rect x="13" y="13" width="3" height="3" fill="#FFB900"/>
  </svg>
);

// HackerRank React Symbol
export const FaReact = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <circle cx="12" cy="12" r="3" fill="#61DAFB"/>
    <ellipse cx="12" cy="12" rx="8" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1"/>
    <ellipse cx="12" cy="12" rx="4" ry="8" fill="none" stroke="#61DAFB" strokeWidth="1"/>
  </svg>
);

// HackerRank Lock Symbol
export const FaLock = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="9" y="10" width="6" height="6" fill="#6B7280"/>
    <path d="M9 10v-2a3 3 0 016 0v2" stroke="#6B7280" strokeWidth="2" fill="none"/>
  </svg>
);

// HackerRank Code Symbol
export const FaCode = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <path d="M8 8l4 4-4 4M16 8l-4 4 4 4" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// HackerRank Brain Symbol
export const FaBrain = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <circle cx="9" cy="10" r="2" fill="#EF4444"/>
    <circle cx="15" cy="10" r="2" fill="#EF4444"/>
    <circle cx="12" cy="15" r="2" fill="#EF4444"/>
    <path d="M9 12l3 2 3-2" stroke="#EF4444" strokeWidth="1" fill="none"/>
  </svg>
);

// HackerRank Book Symbol
export const FaBook = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="7" y="8" width="10" height="8" fill="#10B981"/>
    <path d="M7 8h10M7 12h10" stroke="#059669" strokeWidth="1"/>
  </svg>
);

// HackerRank Chart Bar Symbol
export const FaChartBar = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="8" y="14" width="2" height="4" fill="#8B5CF6"/>
    <rect x="11" y="10" width="2" height="8" fill="#8B5CF6"/>
    <rect x="14" y="12" width="2" height="6" fill="#8B5CF6"/>
  </svg>
);

// HackerRank Users Symbol
export const FaUsers = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <circle cx="9" cy="11" r="2" fill="#EC4899"/>
    <circle cx="15" cy="11" r="2" fill="#EC4899"/>
    <path d="M6 16c0-2 2-3 3-3s3 1 3 3M12 16c0-2 2-3 3-3s3 1 3 3" stroke="#EC4899" strokeWidth="2" fill="none"/>
  </svg>
);

// Additional icons needed by student Course.jsx
export const FaRobot = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="8" y="8" width="8" height="6" rx="1" fill="#10B981"/>
    <circle cx="10" cy="11" r="1" fill="#1F2937"/>
    <circle cx="14" cy="11" r="1" fill="#1F2937"/>
    <rect x="10" y="14" width="4" height="2" fill="#10B981"/>
  </svg>
);

export const FaCloud = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <circle cx="12" cy="12" r="4" fill="#3B82F6"/>
    <circle cx="9" cy="12" r="2" fill="#1F2937"/>
    <circle cx="15" cy="12" r="2" fill="#1F2937"/>
  </svg>
);

export const FaShieldAlt = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <path d="M12 7l5 3v5c0 3-2 5-5 5s-5-2-5-5v-5z" fill="#EF4444"/>
    <path d="M12 10v3M10 12h4" stroke="white" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const FaChartLine = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <path d="M7 14l3-4 3 4 6-6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

export const FaMobile = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="9" y="7" width="6" height="8" rx="1" fill="#14B8A6"/>
    <circle cx="12" cy="16" r="1" fill="#1F2937"/>
  </svg>
);

export const FaGamepad = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="8" y="10" width="8" height="4" rx="2" fill="#A855F7"/>
    <circle cx="10" cy="12" r="1" fill="#1F2937"/>
    <circle cx="14" cy="12" r="1" fill="#1F2937"/>
  </svg>
);

export const FaServer = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="8" y="8" width="8" height="2" fill="#059669"/>
    <rect x="8" y="12" width="8" height="2" fill="#059669"/>
    <circle cx="10" cy="9" r="1" fill="#1F2937"/>
    <circle cx="14" cy="13" r="1" fill="#1F2937"/>
  </svg>
);

export const FaCogs = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <circle cx="12" cy="12" r="4" fill="#64748B"/>
    <circle cx="12" cy="12" r="2" fill="#1F2937"/>
    <path d="M12 8v2M16 12h-2M12 16v-2M8 12h2" stroke="white" strokeWidth="1"/>
  </svg>
);

export const FaLaptopCode = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="7" y="8" width="10" height="6" fill="#0EA5E9"/>
    <path d="M9 11l2-2 2 2M15 11l-2-2-2 2" stroke="white" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const FaGitAlt = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <circle cx="9" cy="10" r="1.5" fill="#F97316"/>
    <circle cx="15" cy="10" r="1.5" fill="#F97316"/>
    <circle cx="12" cy="15" r="1.5" fill="#F97316"/>
    <path d="M9 11.5l3 2.5 3-2.5" stroke="#F97316" strokeWidth="1" fill="none"/>
  </svg>
);

export const FaDocker = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="8" y="8" width="3" height="3" fill="#2496ED"/>
    <rect x="13" y="8" width="3" height="3" fill="#2496ED"/>
    <rect x="8" y="13" width="3" height="3" fill="#2496ED"/>
    <rect x="13" y="13" width="3" height="3" fill="#2496ED"/>
  </svg>
);

export const FaAws = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <path d="M12 8l4 4-4 4-4-4z" fill="#FF9900"/>
    <path d="M12 10l2 2-2 2-2-2z" fill="#1F2937"/>
  </svg>
);

export const FaGoogle = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <circle cx="12" cy="12" r="4" fill="#4285F4"/>
    <circle cx="12" cy="12" r="2" fill="#1F2937"/>
  </svg>
);

export const FaApple = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <circle cx="12" cy="12" r="4" fill="#000000"/>
    <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="1"/>
  </svg>
);

export const FaAndroid = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="9" y="9" width="6" height="6" rx="1" fill="#3DDC84"/>
    <circle cx="11" cy="11" r="1" fill="#1F2937"/>
    <circle cx="13" cy="11" r="1" fill="#1F2937"/>
  </svg>
);

// Additional icons that might be needed
export const FaPlay = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <path d="M9 8l6 4-6 4z" fill="#10B981"/>
  </svg>
);

export const FaTrash = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="8" y="10" width="8" height="6" fill="#EF4444"/>
    <path d="M10 12h4M10 14h4" stroke="white" strokeWidth="1"/>
  </svg>
);

export const FaEdit = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <path d="M8 16l8-8" stroke="#3B82F6" strokeWidth="2"/>
    <path d="M14 8l2 2" stroke="#3B82F6" strokeWidth="2"/>
  </svg>
);

export const FaCheckCircle = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <circle cx="12" cy="12" r="4" fill="#10B981"/>
    <path d="M10 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

export const FaPlus = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <path d="M12 8v8M8 12h8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const FaLink = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <path d="M8 12h8M10 10l4 4M14 10l-4 4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const FaRegEdit = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1F2937"/>
    <rect x="8" y="8" width="8" height="8" fill="#F59E0B"/>
    <path d="M10 14l4-4" stroke="white" strokeWidth="1"/>
    <circle cx="14" cy="10" r="1" fill="white"/>
  </svg>
);

export const FaBootstrap = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#7952B3"/>
    <text x="12" y="17" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white" style={{fontFamily: 'sans-serif'}}>B</text>
  </svg>
);

export const FaHtml5 = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#E34F26"/>
    <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">H5</text>
  </svg>
);

export const FaCss3 = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#1572B6"/>
    <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">C3</text>
  </svg>
);
