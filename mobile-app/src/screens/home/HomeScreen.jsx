import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import CategoryCard from "../../components/cards/CategoryCard";
import ProductCard from "../../components/cards/ProductCard";
import { spacing } from "../../constants/spacing";
import { colors } from "../../constants/colors";

const sampleAd = { title: "Sample listing", price: 25000, city: "Lilongwe" };

const HomeScreen = () => {
  return (
    <ScreenWrapper scroll>
      <View style={styles.section}>
        <Text style={styles.heading}>Explore Zitheke</Text>
        <Text style={styles.subheading}>Browse categories and the latest marketplace listings.</Text>
      </View>
      <View style={styles.row}>
        <CategoryCard title="Vehicles" />
        <CategoryCard title="Electronics" />
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Fresh listings</Text>
        <ProductCard item={sampleAd} />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  subheading: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default HomeScreen;
