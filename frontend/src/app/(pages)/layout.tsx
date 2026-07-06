"use client";

import React, { useState, useEffect, useCallback, createContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { login, logout } from "@/store/slice/userslice";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import TransactionModal from "@/components/TransactionModal";

export const RefreshContext = createContext(0);

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loginstate, userfullname } = useAppSelector((s) => s.userslice);
  const activePage = pathname === "/setting" ? "settings" : "dashboard";
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const restore = async () => {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.loggedIn) {
          dispatch(login(data.user));
        }
      } catch {
        // no session
      } finally {
        setIsCheckingAuth(false);
      }
    };
    restore();
  }, []);

  useEffect(() => {
    if (isCheckingAuth) return;
    if (loginstate && (pathname === "/login" || pathname === "/signup")) {
      router.push("/");
    } else if (!loginstate && pathname !== "/login" && pathname !== "/signup") {
      router.push("/login");
    }
  }, [isCheckingAuth, loginstate, pathname, router]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    dispatch(logout());
    router.push("/login");
  }, [dispatch, router]);

  const handleTransactionAdded = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isCheckingAuth) return null;
  if (!loginstate && !isAuthPage) return null;

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar activePage={activePage} onAddTransaction={() => { setShowModal(true); setIsSidebarOpen(false); }} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar userName={userfullname || "User"} onLogout={handleLogout} onToggleSidebar={() => setIsSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <RefreshContext.Provider value={refreshKey}>
            {children}
          </RefreshContext.Provider>
        </main>
      </div>
      <TransactionModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={handleTransactionAdded} />
    </div>
  );
}
