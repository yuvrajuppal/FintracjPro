import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { addTransaction } from "../services/api";

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Salary",
  "Freelance",
  "Investment",
  "Entertainment",
  "Other",
];

const TransactionModal = ({
  visible,
  onClose,
  onSuccess,
}: TransactionModalProps) => {
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Other");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setType("Expense");
    setDescription("");
    setAmount("");
    setDate("");
    setCategory("Other");
    setError("");
  };

  const handleSubmit = async () => {
    if (!description || !amount || !date) {
      setError("Description, amount, and date are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await addTransaction({
        type,
        description,
        amount: parseFloat(amount),
        date,
        category,
      });
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity
          style={styles.overlayBg}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add Transaction</Text>

              {/* Type Toggle */}
              <View style={styles.typeRow}>
                {(["Expense", "Income"] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeBtn,
                      type === t &&
                        (t === "Income"
                          ? styles.typeBtnIncome
                          : styles.typeBtnExpense),
                    ]}
                    onPress={() => setType(t)}
                  >
                    <Text
                      style={[
                        styles.typeBtnText,
                        type === t && styles.typeBtnTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description */}
              <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Grocery shopping"
                  placeholderTextColor="#9ca3af"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Amount */}
              <View style={styles.field}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              {/* Date */}
              <View style={styles.field}>
                <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-07-07"
                  placeholderTextColor="#9ca3af"
                  value={date}
                  onChangeText={setDate}
                />
              </View>

              {/* Category */}
              <View style={styles.field}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.chipRow}>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.chip,
                        category === c && styles.chipActive,
                      ]}
                      onPress={() => setCategory(c)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          category === c && styles.chipTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Error */}
              {error !== "" && <Text style={styles.error}>{error}</Text>}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Add</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayBg: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  typeBtnExpense: {
    backgroundColor: "#fef2f2",
    borderColor: "#dc2626",
  },
  typeBtnIncome: {
    backgroundColor: "#f0fdf4",
    borderColor: "#16a34a",
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  typeBtnTextActive: {
    color: "#111827",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    fontSize: 14,
    color: "#111827",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  chipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  chipText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  error: {
    fontSize: 13,
    color: "#dc2626",
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  submitBtn: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitBtnDisabled: {
    backgroundColor: "#6b7280",
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
});
