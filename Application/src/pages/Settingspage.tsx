import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { login, logout } from "../store/slice/userslice";
import { updateUser, clearToken } from "../services/api";
import { useNavigation } from "@react-navigation/native";

const currencies = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
];

const Settingspage = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { userfullname, currency: userCurrency, useremail } = useAppSelector(
    (s) => s.userslice
  );

  const [fullName, setFullName] = useState(userfullname);
  const [currency, setCurrency] = useState(userCurrency || "INR");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setFullName(userfullname);
    setCurrency(userCurrency || "INR");
  }, [userfullname, userCurrency]);

  const handleSave = async () => {
    setMsg("");
    setLoading(true);
    try {
      const user = await updateUser(fullName, currency);
      dispatch(login(user));
      setMsg("Profile updated successfully");
    } catch (err: any) {
      setMsg(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearToken();
    dispatch(logout());
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
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
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Manage your account profile and app formatting.
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile Details</Text>

          {/* Email (read-only) */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={useremail}
              editable={false}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Full Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Currency */}
          <View style={styles.field}>
            <Text style={styles.label}>Primary Currency</Text>
            <View style={styles.chipRow}>
              {currencies.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.chip,
                    currency === c.code && styles.chipActive,
                  ]}
                  onPress={() => setCurrency(c.code)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      currency === c.code && styles.chipTextActive,
                    ]}
                  >
                    {c.code} ({c.symbol})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Message */}
          {msg !== "" && (
            <Text
              style={
                msg === "Profile updated successfully"
                  ? styles.msgSuccess
                  : styles.msgError
              }
            >
              {msg}
            </Text>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Settingspage;

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
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
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
  inputDisabled: {
    backgroundColor: "#f9fafb",
    color: "#6b7280",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  msgSuccess: {
    fontSize: 13,
    color: "#16a34a",
    marginBottom: 16,
  },
  msgError: {
    fontSize: 13,
    color: "#dc2626",
    marginBottom: 16,
  },
  saveBtn: {
    width: "100%",
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  logoutBtn: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#dc2626",
  },
});
