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
} from "react-native";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart } from "react-native-chart-kit";
import { useAppSelector } from "../store/hooks";
import {
  getTransactions,
  getTransactionSummary,
  deleteTransaction,
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
    return {
      labels: entries.map(([month]) => month),
      incomeData: entries.map(([, v]) => v.income),
      expenseData: entries.map(([, v]) => v.expense),
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

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Financial Overview</Text>
          <Text style={styles.headerSubtitle}>
            Real-time tracking application
          </Text>
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
                <BarChart
                  data={{
                    labels: chartData.labels,
                    datasets: [
                      { data: chartData.incomeData, color: () => "#16a34a" },
                      { data: chartData.expenseData, color: () => "#dc2626" },
                    ],
                  }}
                  width={screenWidth - 80}
                  height={200}
                  yAxisLabel={curSym}
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: () => "#6b7280",
                    barPercentage: 0.6,
                    propsForBackgroundLines: {
                      strokeDasharray: "5,5",
                      stroke: "#f0f0f0",
                    },
                  }}
                  style={styles.chart}
                  fromZero
                />
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
    padding: 8,
    marginTop: 12,
    alignItems: "center",
  },
  chart: {
    borderRadius: 8,
    marginLeft: -16,
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
