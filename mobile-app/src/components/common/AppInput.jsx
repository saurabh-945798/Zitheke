import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

const AppInput = ({ label, error, style, ...props }) => {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error && styles.errorInput, style]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  errorInput: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
  },
});

export default AppInput;
