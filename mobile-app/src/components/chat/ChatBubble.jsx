import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

const ChatBubble = ({ message, isOwn = false }) => (
  <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
    <Text style={[styles.text, isOwn && styles.ownText]}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 18,
    marginBottom: spacing.sm,
    maxWidth: "80%",
    padding: spacing.md,
  },
  ownBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  otherBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.white,
  },
  text: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
    fontSize: 15,
  },
  ownText: {
    color: colors.white,
  },
});

export default ChatBubble;
