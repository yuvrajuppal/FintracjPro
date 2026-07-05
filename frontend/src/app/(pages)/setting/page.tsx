"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks";

function SettingsPage() {
  const { userfullname, currency: userCurrency } = useAppSelector((s) => s.userslice);
  const [fullName, setFullName] = useState(userfullname);
  const [currency, setCurrency] = useState(userCurrency || "INR");

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your account profile and app formatting.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-[980px]">
        <h2 className="text-lg font-bold mb-5">Profile Details</h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Primary Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
        <button className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          Save Changes
        </button>
      </div>
    </>
  );
}

export default SettingsPage;
