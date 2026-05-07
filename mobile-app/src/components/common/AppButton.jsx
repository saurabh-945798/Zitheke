import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

const AppButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.button,
    variant === "secondary" ? styles.secondaryButton : styles.primaryButton,
    disabled && styles.disabledButton,
    style,
  ];

  const labelStyle = [
    styles.label,
    variant === "secondary" ? styles.secondaryLabel : styles.primaryLabel,
    textStyle,
  ];

  return (
    <Pressable style={buttonStyle} onPress={onPress} disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? colors.primary : colors.white} />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
  label: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
  },
  primaryLabel: {
    color: colors.white,
  },
  secondaryLabel: {
    color: colors.primary,
  },
});

export default AppButton;
