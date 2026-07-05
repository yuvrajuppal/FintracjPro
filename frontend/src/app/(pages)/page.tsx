"use client";

import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { RefreshContext } from "./layout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

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

  const formatCurrency = (amount: number) =>
    `₹${amount.toFixed(2)}`;

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
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time tracking application</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
            </svg>
          </div>
          <div className="text-sm text-gray-500 mb-1">Current Balance</div>
          <div className={`text-2xl font-bold ${summary.totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {summary.totalBalance >= 0 ? "+" : "-"}{formatCurrency(Math.abs(summary.totalBalance))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
              <polyline points="16,7 22,7 22,13" />
            </svg>
          </div>
          <div className="text-sm text-gray-500 mb-1">Total Income</div>
          <div className="text-2xl font-bold text-green-600">+{formatCurrency(Math.abs(summary.totalIncome))}</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,17 13.5,8.5 8.5,13.5 2,7" />
              <polyline points="16,17 22,17 22,11" />
            </svg>
          </div>
          <div className="text-sm text-gray-500 mb-1">Total Expense</div>
          <div className="text-2xl font-bold text-red-600">-{formatCurrency(Math.abs(summary.totalExpense))}</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
          </div>
          <div className="text-sm text-gray-500 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold">{summary.totalTransactions}</div>
        </div>
      </div>

      {/* Chart + Preferences row */}
      <div className="grid grid-cols-[1fr_280px] gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold mb-4">Cash Flow Analysis</h2>
          <div className="border border-gray-100 rounded-lg p-4">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">
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
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold mb-5">Preferences</h2>
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-medium">Dark Mode</span>
            <button className="w-10 h-5.5 bg-gray-200 rounded-full relative transition-colors">
              <span className="absolute left-0.5 top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform" />
            </button>
          </div>
          <hr className="border-gray-100 mb-5" />
          <button className="w-full flex items-center justify-center gap-2 text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 text-sm font-medium py-2.5 rounded-lg transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Reset All Data
          </button>
        </div>
      </div>

      {/* All Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-bold mb-4">All Transactions</h2>
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
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          >
            <option>All Types</option>
            <option>Income</option>
            <option>Expense</option>
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 py-4 text-center">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No transactions yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Description</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-sm text-gray-700">{formatDate(txn.date)}</td>
                  <td className="py-3 text-sm text-gray-700">{txn.description}</td>
                  <td className="py-3 text-sm text-gray-700">{txn.category}</td>
                  <td className={`py-3 text-sm font-medium ${txn.type === "Income" ? "text-green-600" : "text-red-600"}`}>
                    {txn.type === "Income" ? "+" : "-"}{formatCurrency(txn.amount)}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDelete(txn.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-xl border border-gray-200 w-full max-w-sm p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Transaction</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
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
    </>
  );
}

export default DashboardPage;
