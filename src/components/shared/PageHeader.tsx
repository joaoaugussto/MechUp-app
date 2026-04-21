import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.wrap, styles.row]}>
      <View style={styles.textBlock}>
        <Text variant="headlineMedium" style={{ color: theme.colors.onSurface }}>
          {title}
        </Text>
        {description ? (
          <Text variant="bodyMedium" style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            {description}
          </Text>
        ) : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  wrap: {
    marginBottom: 16,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  desc: {
    marginTop: 4,
  },
  action: {
    flexShrink: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
});
