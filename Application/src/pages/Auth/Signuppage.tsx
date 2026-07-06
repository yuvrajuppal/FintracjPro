import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { login } from "../../store/slice/userslice";
import { signupUser } from "../../services/api";

interface SignuppageProps {
  onSignup?: () => void;
  onNavigateLogin?: () => void;
}

const Signuppage = ({ onSignup, onNavigateLogin }: SignuppageProps) => {
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      setError("All fields are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await signupUser(fullName, email, password);
      dispatch(login(user));
      onSignup?.();
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/applogoimage.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoTitle}>FinTrack Pro</Text>
            <Text style={styles.logoSubtitle}>Enterprise Finance</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign Up</Text>
            <Text style={styles.cardSubtitle}>
              Create an account to get started.
            </Text>

            <View style={styles.formSpace}>
              {/* Full Name */}
              <View>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Email */}
              <View>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password */}
              <View>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Error */}
            {error !== "" && <Text style={styles.error}>{error}</Text>}

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Log in link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={onNavigateLogin}>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signuppage;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  container: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 140,
    height: 50,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    lineHeight: 22,
    marginTop: 8,
  },
  logoSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
  },
  formSpace: {
    gap: 16,
  },
  label: {
    fontSize: 14,
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
  error: {
    fontSize: 14,
    color: "#dc2626",
    marginTop: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: "#6b7280",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563eb",
  },
});
