"use client";

import React, { useState, useEffect, useCallback, useContext, useMemo, useRef } from "react";
import { RefreshContext } from "./layout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useThemeToggle } from "@/components/skiper26";
import { useAppSelector } from "@/store/hooks";

interface Transaction {
  id: string;
  type: string;
  paymentType: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface Summary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalTransactions: number;
}

function DashboardPage() {
  const refreshKey = useContext(RefreshContext);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const { isDark, toggleTheme } = useThemeToggle();
  const { currency } = useAppSelector((s) => s.userslice);
  const sym: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  const curSym = sym[currency] || "₹";
  const clickSound = useRef<HTMLAudioElement | null>(null);
  if (typeof window !== "undefined" && !clickSound.current) {
    clickSound.current = new Audio("/clicksoundeffect.mp3");
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "All Types") params.set("type", typeFilter);
      if (search) params.set("search", search);
      const qs = params.toString();

      const [txnRes, sumRes] = await Promise.all([
        fetch(`/api/transactions${qs ? `?${qs}` : ""}`),
        fetch("/api/transactions/summary"),
      ]);

      const txnData = await txnRes.json();
      const sumData = await sumRes.json();

      if (txnRes.ok) setTransactions(txnData.transactions);
      if (sumRes.ok) setSummary(sumData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const chartData = useMemo(() => {
    const grouped: Record<string, { income: number; expense: number }> = {};
    for (const t of transactions) {
      const d = new Date(t.date);
      const key = `${d.toLocaleString("en", { month: "short" })} ${d.getFullYear()}`;
      if (!grouped[key]) grouped[key] = { income: 0, expense: 0 };
      if (t.type === "Income") grouped[key].income += t.amount;
      else grouped[key].expense += t.amount;
    }
    return Object.entries(grouped).map(([month, v]) => ({
      month,
      Income: v.income,
      Expense: v.expense,
    }));
  }, [transactions]);

  const handleDelete = (id: string) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/transactions/${deleteTarget}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch {
      // ignore
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleResetAll = () => {
    setShowResetModal(true);
  };

  const confirmResetAll = async () => {
    try {
      const res = await fetch("/api/transactions/delete-all", { method: "DELETE" });
      if (res.ok) fetchData();
    } catch {
      // ignore
    } finally {
      setShowResetModal(false);
    }
  };

  const formatCurrency = (amount: number) =>
    `${curSym}${amount.toFixed(2)}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Financial Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Real-time tracking application</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
            </svg>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Balance</div>
          <div className={`text-2xl font-bold ${summary.totalBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {summary.totalBalance >= 0 ? "+" : "-"}{formatCurrency(Math.abs(summary.totalBalance))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
              <polyline points="16,7 22,7 22,13" />
            </svg>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Income</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">+{formatCurrency(Math.abs(summary.totalIncome))}</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,17 13.5,8.5 8.5,13.5 2,7" />
              <polyline points="16,17 22,17 22,11" />
            </svg>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Expense</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">-{formatCurrency(Math.abs(summary.totalExpense))}</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold dark:text-gray-100">{summary.totalTransactions}</div>
        </div>
      </div>

      {/* Chart + Preferences row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Cash Flow Analysis</h2>
          <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-sm text-gray-400 dark:text-gray-500">
                No data to display
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-bold mb-5 text-gray-900 dark:text-gray-100">Preferences</h2>
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Mode</span>
            <button
              onClick={() => { toggleTheme(); clickSound.current?.play(); }}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center transition-transform duration-300 ${isDark ? "translate-x-6" : "translate-x-0"}`}
              >
                {isDark ? (
                  <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2" stroke="currentColor" fill="none" />
                  </svg>
                )}
              </span>
            </button>
          </div>
          <hr className="border-gray-100 dark:border-gray-700 mb-5" />
          <button onClick={handleResetAll} className="w-full flex items-center justify-center gap-2 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-medium py-2.5 rounded-lg transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Reset All Data
          </button>
        </div>
      </div>

      {/* All Transactions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">All Transactions</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          >
            <option>All Types</option>
            <option>Income</option>
            <option>Expense</option>
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pb-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pb-3">Description</th>
                <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pb-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pb-3">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{formatDate(txn.date)}</td>
                  <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{txn.description}</td>
                  <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{txn.category}</td>
                  <td className={`py-3 text-sm font-medium ${txn.type === "Income" ? "text-green-600" : "text-red-600"}`}>
                    {txn.type === "Income" ? "+" : "-"}{formatCurrency(txn.amount)}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDelete(txn.id)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Transaction</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset All Data confirmation modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Reset All Data</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete all transactions? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmResetAll}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardPage;
