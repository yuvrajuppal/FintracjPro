"use client";

import React from "react";

interface NavbarProps {
  userName: string;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

export default function Navbar({ userName, onLogout, onToggleSidebar }: NavbarProps) {
  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 shrink-0">
      <button
        onClick={onToggleSidebar}
        className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      <div className="flex items-center gap-4 ml-auto">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{userName}</span>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 transition-colors"
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
