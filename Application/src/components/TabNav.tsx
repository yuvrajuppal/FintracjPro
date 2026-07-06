import React, { useState, useCallback } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Homepage from "../pages/Homepage";
import Settingspage from "../pages/Settingspage";
import TransactionModal from "./TransactionModal";

const Tab = createBottomTabNavigator();

const TabNav = () => {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionAdded = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#111827",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            paddingBottom: 4,
            height: 56,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
          },
        }}
      >
        <Tab.Screen
          name="Home"
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        >
          {() => <Homepage refreshKey={refreshKey} />}
        </Tab.Screen>
        <Tab.Screen
          name="Settings"
          component={Settingspage}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Transaction Modal */}
      <TransactionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleTransactionAdded}
      />
    </SafeAreaView>
  );
};

export default TabNav;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 70,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
