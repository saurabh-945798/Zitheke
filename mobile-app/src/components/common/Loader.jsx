import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";

const Loader = () => (
  <View style={styles.container}>
    <ActivityIndicator color={colors.primary} size="large" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});

export default Loader;
