import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { MD3Theme } from "react-native-paper/lib/typescript/types";
import { Card, Text, useTheme } from "react-native-paper";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: string;
  variant?: "default" | "gold" | "primary" | "success" | "warning";
}

function variantBorder(theme: MD3Theme, variant: NonNullable<StatCardProps["variant"]>) {
  switch (variant) {
    case "gold":
      return { borderColor: "#D4AF37", borderWidth: 1 };
    case "primary":
      return { borderColor: theme.colors.primary, borderWidth: 1 };
    case "success":
      return { borderColor: theme.colors.tertiary ?? "#2E7D32", borderWidth: 1 };
    case "warning":
      return { borderColor: "#FF9800", borderWidth: 1 };
    default:
      return { borderColor: theme.colors.outlineVariant, borderWidth: 1 };
  }
}

function iconSurface(variant: NonNullable<StatCardProps["variant"]>, theme: MD3Theme) {
  switch (variant) {
    case "gold":
      return { bg: "rgba(184, 134, 11, 0.15)", fg: "#B8860B" };
    case "primary":
      return { bg: theme.colors.primaryContainer, fg: theme.colors.onPrimaryContainer };
    case "success":
      return { bg: "rgba(46, 125, 50, 0.12)", fg: theme.colors.tertiary ?? "#2E7D32" };
    case "warning":
      return { bg: "rgba(255, 152, 0, 0.14)", fg: "#E65100" };
    default:
      return { bg: theme.colors.surfaceVariant, fg: theme.colors.onSurfaceVariant };
  }
}

export function StatCard({ label, value, icon, hint, variant = "default" }: StatCardProps) {
  const theme = useTheme();
  const border = variantBorder(theme, variant);
  const iconTone = iconSurface(variant, theme);

  return (
    <Card mode="elevated" style={[styles.card, border]}>
      <Card.Content style={styles.row}>
        <View style={styles.textCol}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, letterSpacing: 0.5 }}>
            {label.toUpperCase()}
          </Text>
          <Text
            variant="headlineSmall"
            style={[styles.value, { color: theme.colors.onSurface }]}
            numberOfLines={1}
            ellipsizeMode="clip"
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {value}
          </Text>
          {hint ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {hint}
            </Text>
          ) : null}
        </View>
        {icon ? (
          <View style={[styles.iconBox, { backgroundColor: iconTone.bg }]}>{icon}</View>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    marginTop: 6,
    fontWeight: "700",
    flexShrink: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
