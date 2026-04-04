import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, radius } from "@/constants/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!", headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  code: {
    fontSize: 64,
    fontWeight: "900" as const,
    color: colors.textMuted,
    letterSpacing: -3,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  link: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
  },
  linkText: {
    fontSize: 14,
    color: colors.acidYellow,
    fontWeight: "700" as const,
  },
});
