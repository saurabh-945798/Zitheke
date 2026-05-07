import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";

const ScreenWrapper = ({ children, scroll = false, contentStyle }) => {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  return <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>;
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
});

export default ScreenWrapper;
