import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <Card mode="outlined" style={[styles.card, { borderColor: theme.colors.outlineVariant }]}>
      <Card.Content style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceVariant }]}>
          {icon ?? <MaterialCommunityIcons name="inbox-outline" size={28} color={theme.colors.onSurfaceVariant} />}
        </View>
        <Text variant="titleMedium" style={{ textAlign: "center" }}>
          {title}
        </Text>
        {description ? (
          <Text variant="bodyMedium" style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            {description}
          </Text>
        ) : null}
        {action ? <View style={styles.action}>{action}</View> : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderStyle: "dashed",
  },
  content: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  desc: {
    textAlign: "center",
    maxWidth: 280,
  },
  action: {
    marginTop: 8,
  },
});
