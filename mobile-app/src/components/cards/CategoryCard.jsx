import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

const CategoryCard = ({ title, onPress }) => (
  <Pressable style={styles.card} onPress={onPress}>
    <Text style={styles.title}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 120,
    padding: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
  },
});

export default CategoryCard;
