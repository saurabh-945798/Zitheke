import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

const SellerCard = ({ seller }) => (
  <View style={styles.card}>
    <Text style={styles.name}>{seller?.name || "Seller"}</Text>
    <Text style={styles.meta}>{seller?.location || "Location unavailable"}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.md,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
  },
  meta: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    marginTop: spacing.xs,
  },
});

export default SellerCard;
