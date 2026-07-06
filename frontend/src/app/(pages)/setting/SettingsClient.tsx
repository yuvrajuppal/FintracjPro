"use client";

import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { login } from "@/store/slice/userslice";

function SettingsPage() {
  const dispatch = useAppDispatch();
  const { userfullname, useremail, currency: userCurrency } = useAppSelector((s) => s.userslice);
  const [fullName, setFullName] = useState(userfullname);
  const [currency, setCurrency] = useState(userCurrency || "INR");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, currency }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Update failed");
        return;
      }
      dispatch(login(data.user));
      setMsg("Profile updated successfully");
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Manage your account profile and app formatting.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-[980px]">
        <h2 className="text-lg font-bold mb-5 text-gray-900 dark:text-gray-100">Profile Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={useremail}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-sm cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Primary Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {msg && (
          <p className={`text-sm mb-4 ${msg === "Profile updated successfully" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {msg}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 text-white dark:text-gray-900 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  );
}

export default SettingsPage;
