import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import StackNav from "./src/components/StackNav";

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StackNav />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
