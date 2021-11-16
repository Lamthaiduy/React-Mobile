import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home";
import FormScreen from "../screens/Form";
import ViewScreen from "../screens/ViewScreen";

const TabNavigaion = createBottomTabNavigator();

const AppNavigation = () => (
  <NavigationContainer>
    <TabNavigaion.Navigator>
      <TabNavigaion.Screen name="Home" component={HomeScreen} />
      <TabNavigaion.Screen name="Form" component={FormScreen} />
      <TabNavigaion.Screen name="Data" component={ViewScreen} />
    </TabNavigaion.Navigator>
  </NavigationContainer>
);

export default AppNavigation;
