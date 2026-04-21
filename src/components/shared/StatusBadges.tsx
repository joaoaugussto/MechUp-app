import type { PaymentStatus, ServiceStatus } from "@/lib/mock-data";
import { StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper/lib/typescript/types";
import { Chip, useTheme } from "react-native-paper";

const paymentConfig: Record<
  PaymentStatus,
  { label: string; tone: "success" | "gold" | "primary" }
> = {
  pago: { label: "Pago", tone: "success" },
  adiantado: { label: "Adiantado", tone: "gold" },
  pendente: { label: "Pendente", tone: "primary" },
};

const serviceConfig: Record<ServiceStatus, { label: string; tone: "muted" | "warning" | "success" }> = {
  a_fazer: { label: "A fazer", tone: "muted" },
  em_andamento: { label: "Em andamento", tone: "warning" },
  concluido: { label: "Concluído", tone: "success" },
};

function toneColors(theme: MD3Theme, tone: "success" | "gold" | "primary" | "muted" | "warning") {
  switch (tone) {
    case "success":
      return {
        text: theme.colors.tertiary ?? "#2E7D32",
        border: theme.colors.tertiary ?? "#2E7D32",
        bg: theme.colors.elevation.level1,
      };
    case "gold":
      return { text: "#B8860B", border: "#D4AF37", bg: "rgba(184, 134, 11, 0.12)" };
    case "primary":
      return { text: theme.colors.primary, border: theme.colors.primary, bg: theme.colors.primaryContainer };
    case "warning":
      return { text: "#E65100", border: "#FF9800", bg: "rgba(255, 152, 0, 0.14)" };
    default:
      return {
        text: theme.colors.onSurfaceVariant,
        border: theme.colors.outline,
        bg: theme.colors.surfaceVariant,
      };
  }
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const theme = useTheme();
  const { label, tone } = paymentConfig[status];
  const c = toneColors(theme, tone);

  return (
    <Chip mode="outlined" compact style={[styles.chip, { borderColor: c.border, backgroundColor: c.bg }]} textStyle={{ color: c.text }}>
      {label}
    </Chip>
  );
}

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  const theme = useTheme();
  const { label, tone } = serviceConfig[status];
  const c = toneColors(theme, tone);

  return (
    <Chip mode="outlined" compact style={[styles.chip, { borderColor: c.border, backgroundColor: c.bg }]} textStyle={{ color: c.text }}>
      {label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
  },
});
