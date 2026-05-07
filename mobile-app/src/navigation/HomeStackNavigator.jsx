import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/home/HomeScreen";
import SearchScreen from "../screens/home/SearchScreen";
import CategoryScreen from "../screens/home/CategoryScreen";
import ProductDetailsScreen from "../screens/home/ProductDetailsScreen";

const Stack = createNativeStackNavigator();

const HomeStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: "Home" }} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="Category" component={CategoryScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
  </Stack.Navigator>
);

export default HomeStackNavigator;
