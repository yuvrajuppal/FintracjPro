"use client";

import React from "react";

interface NavbarProps {
  userName: string;
  onLogout?: () => void;
}

export default function Navbar({ userName, onLogout }: NavbarProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">{userName}</span>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
            />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
