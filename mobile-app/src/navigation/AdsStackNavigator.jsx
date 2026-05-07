import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyAdsScreen from "../screens/ads/MyAdsScreen";
import CreateAdScreen from "../screens/ads/CreateAdScreen";
import EditAdScreen from "../screens/ads/EditAdScreen";
import FavoritesScreen from "../screens/ads/FavoritesScreen";

const Stack = createNativeStackNavigator();

const AdsStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="MyAdsScreen" component={MyAdsScreen} options={{ title: "My Ads" }} />
    <Stack.Screen name="CreateAd" component={CreateAdScreen} />
    <Stack.Screen name="EditAd" component={EditAdScreen} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} />
  </Stack.Navigator>
);

export default AdsStackNavigator;
