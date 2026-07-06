import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login } from "../store/slice/userslice";
import { checkAuth, getToken } from "../services/api";
import Loginpage from "../pages/Auth/Loginpage";
import Signuppage from "../pages/Auth/Signuppage";
import TabNav from "./TabNav";

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNav = () => {
  const dispatch = useAppDispatch();
  const { loginstate } = useAppSelector((s) => s.userslice);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const token = await getToken();
        if (!token) {
          return;
        }
        const { loggedIn, user } = await checkAuth();
        if (loggedIn && user) {
          dispatch(login(user));
        }
      } catch {
        // no session
      } finally {
        setChecking(false);
      }
    };
    restore();
  }, [dispatch]);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" }}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={loginstate ? "Main" : "Login"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login">
        {({ navigation }) => (
          <Loginpage
            onLogin={() => navigation.navigate("Main")}
            onNavigateSignup={() => navigation.navigate("Signup")}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Signup">
        {({ navigation }) => (
          <Signuppage
            onSignup={() => navigation.navigate("Main")}
            onNavigateLogin={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Main" component={TabNav} />
    </Stack.Navigator>
  );
};

export default StackNav;
