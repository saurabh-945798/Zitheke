import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { formatPrice } from "../../utils/formatPrice";

const ProductCard = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.title} numberOfLines={2}>
      {item?.title || "Product"}
    </Text>
    <Text style={styles.price}>{formatPrice(item?.price)}</Text>
    <Text style={styles.meta} numberOfLines={1}>
      {item?.location || item?.city || "Location unavailable"}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    gap: spacing.xs,
    padding: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
  },
  price: {
    color: colors.primary,
    fontFamily: typography.fontFamily.extrabold,
    fontSize: 18,
  },
  meta: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
  },
});

export default ProductCard;
