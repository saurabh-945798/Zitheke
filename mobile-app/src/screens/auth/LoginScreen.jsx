import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import AppInput from "../../components/common/AppInput";
import AppButton from "../../components/common/AppButton";
import { useAuth } from "../../hooks/useAuth";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

const HIGHLIGHTS = [
  "Post and manage your listings faster",
  "Reply to buyers from one account",
  "Track favorites and seller activity",
];

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isDisabled = useMemo(
    () => !email.trim() || !password.trim() || loading,
    [email, password, loading]
  );

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login({ email: email.trim(), password });
    } catch (error) {
      Alert.alert("Login failed", error?.friendlyMessage || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scroll contentStyle={styles.screenContent}>
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />

      <View style={styles.shell}>
        <View style={styles.loginFrame}>
          <View style={styles.brandPanel}>
            <View style={styles.brandGlowLarge} />
            <View style={styles.brandGlowSmall} />

            <View style={styles.logoRow}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoMark}>Z</Text>
              </View>
              <View>
                <Text style={styles.brandName}>Zitheke</Text>
                <Text style={styles.brandTagline}>Buy. Sell. Connect.</Text>
              </View>
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Buy, sell and connect with confidence</Text>
              <Text style={styles.heroSubtitle}>
                Access your marketplace account, manage listings, and stay close
                to every buyer conversation from one place.
              </Text>
            </View>

            <View style={styles.highlightStack}>
              {HIGHLIGHTS.map((item) => (
                <View key={item} style={styles.highlightItem}>
                  <View style={styles.highlightDot} />
                  <Text style={styles.highlightText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formEyebrow}>Account access</Text>
              <Text style={styles.formTitle}>Login</Text>
              <Text style={styles.formSubtitle}>
                Use your email and password to continue your Zitheke journey.
              </Text>
            </View>

            <View style={styles.form}>
              <AppInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Enter your email"
              />

              <AppInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter your password"
              />

              <Pressable
                onPress={() => navigation.navigate("ForgotPassword")}
                style={styles.inlineAction}
              >
                <Text style={styles.inlineActionText}>Forgot password?</Text>
              </Pressable>

              <AppButton
                title="Login to Zitheke"
                onPress={handleLogin}
                loading={loading}
                disabled={isDisabled}
                style={styles.primaryButton}
              />

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>New here?</Text>
                <View style={styles.divider} />
              </View>

              <AppButton
                title="Create a new account"
                onPress={() => navigation.navigate("Register")}
                variant="secondary"
                style={styles.secondaryButton}
              />
            </View>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    backgroundColor: "#F5F7FF",
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
  },
  backgroundOrbTop: {
    backgroundColor: "rgba(46,49,146,0.14)",
    borderRadius: 999,
    height: 220,
    position: "absolute",
    right: -80,
    top: -30,
    width: 220,
  },
  backgroundOrbBottom: {
    backgroundColor: "rgba(244,144,12,0.16)",
    borderRadius: 999,
    bottom: 80,
    height: 240,
    left: -100,
    position: "absolute",
    width: 240,
  },
  shell: {
    gap: spacing.lg,
  },
  loginFrame: {
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 32,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#1A1D64",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
  },
  brandPanel: {
    backgroundColor: colors.primaryDark,
    padding: spacing.xl,
    position: "relative",
  },
  brandGlowLarge: {
    backgroundColor: "rgba(244,144,12,0.18)",
    borderRadius: 999,
    height: 180,
    position: "absolute",
    right: -70,
    top: -40,
    width: 180,
  },
  brandGlowSmall: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    bottom: -30,
    height: 120,
    left: -20,
    position: "absolute",
    width: 120,
  },
  logoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  logoBadge: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 18,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  logoMark: {
    color: colors.primaryDark,
    fontFamily: typography.fontFamily.extrabold,
    fontSize: 24,
  },
  brandName: {
    color: colors.white,
    fontFamily: typography.fontFamily.extrabold,
    fontSize: 24,
  },
  brandTagline: {
    color: "rgba(255,255,255,0.76)",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    marginTop: 2,
  },
  heroCopy: {
    marginTop: spacing.xl,
    maxWidth: 320,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: typography.fontFamily.extrabold,
    fontSize: 30,
    letterSpacing: -0.5,
    lineHeight: 36,
    marginTop: spacing.xl,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  highlightStack: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  highlightItem: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  highlightDot: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  highlightText: {
    color: colors.white,
    flex: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
  },
  formHeader: {
    gap: spacing.xs,
  },
  formEyebrow: {
    color: colors.primary,
    fontFamily: typography.fontFamily.extrabold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  formTitle: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.extrabold,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  inlineAction: {
    alignSelf: "flex-end",
  },
  inlineActionText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  divider: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  secondaryButton: {
    borderColor: "#D8DEEF",
    },
});

export default LoginScreen;
