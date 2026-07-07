import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAppSelector } from "../store/hooks";
import {
  getTransactions,
  getTransactionSummary,
  deleteTransaction,
  deleteAllTransactions,
  Transaction,
  Summary,
} from "../services/api";

const screenWidth = Dimensions.get("window").width;

const sym: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };

interface HomepageProps {
  refreshKey?: number;
}

const Homepage = ({ refreshKey = 0 }: HomepageProps) => {
  const { currency } = useAppSelector((s) => s.userslice);
  const curSym = sym[currency] || "₹";

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [txnData, sumData] = await Promise.all([
        getTransactions(typeFilter, search),
        getTransactionSummary(),
      ]);
      setTransactions(txnData);
      setSummary(sumData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const chartData = useMemo(() => {
    const grouped: Record<string, { income: number; expense: number }> = {};
    for (const t of transactions) {
      const d = new Date(t.date);
      const key = `${d.toLocaleString("en", { month: "short" })} ${d.getFullYear()}`;
      if (!grouped[key]) grouped[key] = { income: 0, expense: 0 };
      if (t.type === "Income") grouped[key].income += t.amount;
      else grouped[key].expense += t.amount;
    }
    const entries = Object.entries(grouped);
    const allValues = entries.flatMap(([, v]) => [v.income, v.expense]);
    const maxVal = Math.max(...allValues, 1);
    return {
      labels: entries.map(([month]) => month),
      incomeData: entries.map(([, v]) => v.income),
      expenseData: entries.map(([, v]) => v.expense),
      maxVal,
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => `${curSym}${amount.toFixed(2)}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTransaction(deleteTarget);
      fetchData();
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
      await deleteAllTransactions();
      fetchData();
    } catch {
      // ignore
    } finally {
      setShowResetModal(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Financial Overview</Text>
              <Text style={styles.headerSubtitle}>
                Real-time tracking application
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
                <MaterialIcons name="refresh" size={18} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetBtn} onPress={handleResetAll}>
                <Text style={styles.resetBtnText}>Reset All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stat Cards */}
        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#eff6ff" }]}>
              <Text style={{ fontSize: 18 }}>🏦</Text>
            </View>
            <Text style={styles.statLabel}>Current Balance</Text>
            <Text
              style={[
                styles.statValue,
                summary.totalBalance >= 0 ? styles.textGreen : styles.textRed,
              ]}
            >
              {summary.totalBalance >= 0 ? "+" : "-"}
              {formatCurrency(Math.abs(summary.totalBalance))}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#f0fdf4" }]}>
              <Text style={{ fontSize: 18 }}>📈</Text>
            </View>
            <Text style={styles.statLabel}>Total Income</Text>
            <Text style={[styles.statValue, styles.textGreen]}>
              +{formatCurrency(Math.abs(summary.totalIncome))}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#fef2f2" }]}>
              <Text style={{ fontSize: 18 }}>📉</Text>
            </View>
            <Text style={styles.statLabel}>Total Expense</Text>
            <Text style={[styles.statValue, styles.textRed]}>
              -{formatCurrency(Math.abs(summary.totalExpense))}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#eff6ff" }]}>
              <Text style={{ fontSize: 18 }}>🛒</Text>
            </View>
            <Text style={styles.statLabel}>Total Transactions</Text>
            <Text style={[styles.statValue, styles.textDark]}>
              {summary.totalTransactions}
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Cash Flow Analysis</Text>
          <View style={styles.chartContainer}>
            {loading ? (
              <View style={styles.noData}>
                <ActivityIndicator color="#6b7280" />
              </View>
            ) : chartData.labels.length === 0 ? (
              <View style={styles.noData}>
                <Text style={styles.noDataText}>No data to display</Text>
              </View>
            ) : (
              <View>
                {/* Y-axis labels + Bars */}
                <View style={styles.chartArea}>
                  <View style={styles.yAxis}>
                    {[4, 3, 2, 1, 0].map((i) => (
                      <Text key={i} style={styles.yLabel}>
                        {curSym}{Math.round((chartData.maxVal * i) / 4)}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.barsContainer}>
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        style={[styles.gridLine, { bottom: `${i * 25}%` }]}
                      />
                    ))}
                    {/* Bar groups */}
                    <View style={styles.barGroupsRow}>
                      {chartData.labels.map((label, idx) => (
                        <View key={label} style={styles.barGroup}>
                          <View style={styles.barsPair}>
                            <View
                              style={[
                                styles.bar,
                                styles.barIncome,
                                {
                                  height: `${
                                    chartData.maxVal > 0
                                      ? (chartData.incomeData[idx] / chartData.maxVal) * 100
                                      : 0
                                  }%`,
                                },
                              ]}
                            />
                            <View
                              style={[
                                styles.bar,
                                styles.barExpense,
                                {
                                  height: `${
                                    chartData.maxVal > 0
                                      ? (chartData.expenseData[idx] / chartData.maxVal) * 100
                                      : 0
                                  }%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.xLabel}>{label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
                {/* Legend */}
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#16a34a" }]} />
                    <Text style={styles.legendText}>Income</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#dc2626" }]} />
                    <Text style={styles.legendText}>Expense</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* All Transactions */}
        <View style={styles.txnCard}>
          <Text style={styles.sectionTitle}>All Transactions</Text>

          <View style={styles.filterRow}>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search transactions..."
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          <View style={styles.typeFilterRow}>
            {["All Types", "Income", "Expense"].map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeFilterBtn,
                  typeFilter === t && styles.typeFilterBtnActive,
                ]}
                onPress={() => setTypeFilter(t)}
              >
                <Text
                  style={[
                    styles.typeFilterText,
                    typeFilter === t && styles.typeFilterTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator color="#6b7280" />
            </View>
          ) : transactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet.</Text>
          ) : (
            transactions.map((txn) => (
              <View key={txn.id} style={styles.txnRow}>
                <View style={styles.txnLeft}>
                  <View style={styles.txnIconContainer}>
                    <Text style={styles.txnIcon}>
                      {txn.type === "Income" ? "📈" : "📉"}
                    </Text>
                  </View>
                  <View style={styles.txnInfo}>
                    <Text style={styles.txnDesc}>{txn.description}</Text>
                    <Text style={styles.txnMeta}>
                      {formatDate(txn.date)} · {txn.category}
                    </Text>
                  </View>
                </View>
                <View style={styles.txnRight}>
                  <Text
                    style={[
                      styles.txnAmount,
                      txn.type === "Income" ? styles.textGreen : styles.textRed,
                    ]}
                  >
                    {txn.type === "Income" ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </Text>
                  <TouchableOpacity onPress={() => setDeleteTarget(txn.id)}>
                    <Text style={styles.deleteBtn}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Transaction</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={styles.modalCancelText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteBtn}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalDeleteText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reset All Data Confirmation Modal */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset All Data</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to delete all transactions? This action
              cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowResetModal(false)}
              >
                <Text style={styles.modalCancelText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteBtn}
                onPress={confirmResetAll}
              >
                <Text style={styles.modalDeleteText}>Yes, Delete All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Homepage;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#dc2626",
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  chartCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 16,
  },
  chartContainer: {
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  chartArea: {
    flexDirection: "row",
    height: 180,
  },
  yAxis: {
    width: 40,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 6,
  },
  yLabel: {
    fontSize: 10,
    color: "#9ca3af",
  },
  barsContainer: {
    flex: 1,
    justifyContent: "flex-start",
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#f3f4f6",
  },
  barGroupsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: "100%",
    paddingHorizontal: 8,
  },
  barGroup: {
    alignItems: "center",
    flex: 1,
  },
  barsPair: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: "100%",
  },
  bar: {
    width: 18,
    borderRadius: 4,
  },
  barIncome: {
    backgroundColor: "#16a34a",
  },
  barExpense: {
    backgroundColor: "#dc2626",
  },
  xLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "center",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#6b7280",
  },
  noData: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    fontSize: 13,
    color: "#9ca3af",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  txnCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  filterRow: {
    marginTop: 12,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  typeFilterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  typeFilterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  typeFilterBtnActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  typeFilterText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  typeFilterTextActive: {
    color: "#ffffff",
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 16,
  },
  txnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  txnLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  txnIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txnIcon: {
    fontSize: 16,
  },
  txnInfo: {
    flex: 1,
  },
  txnDesc: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  txnMeta: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  txnRight: {
    alignItems: "flex-end",
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  deleteBtn: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  modalDeleteBtn: {
    flex: 1,
    backgroundColor: "#dc2626",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalDeleteText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  textGreen: {
    color: "#16a34a",
  },
  textRed: {
    color: "#dc2626",
  },
  textDark: {
    color: "#111827",
  },
});
