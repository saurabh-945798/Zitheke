import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import AppButton from "../common/AppButton";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

const ChatInput = ({ value, onChangeText, onSend, loading = false }) => (
  <View style={styles.container}>
    <TextInput
      placeholder="Type a message"
      placeholderTextColor={colors.textMuted}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
    />
    <AppButton title="Send" onPress={onSend} loading={loading} style={styles.button} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  button: {
    minWidth: 96,
  },
});

export default ChatInput;
