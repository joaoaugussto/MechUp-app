import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { MD3Theme } from "react-native-paper/lib/typescript/types";
import { Button, Card, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, formatBRL, type Car, type Client, type Service } from "@/lib/api";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { PaymentBadge, ServiceStatusBadge } from "@/src/components/shared/StatusBadges";
import { StatCard } from "@/src/components/shared/StatCard";

export default function DashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [clients, setClients] = useState<Client[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    api.getClients().then(setClients).catch(() => setClients([]));
    api.getCars().then(setCars).catch(() => setCars([]));
    api.getServices().then(setServices).catch(() => setServices([]));
  }, []);

  const financialSummary = useMemo(() => {
    const totalRecebido = services.filter((s) => s.payment === "pago").reduce((a, s) => a + s.price, 0);
    const totalAdiantado = services.filter((s) => s.payment === "adiantado").reduce((a, s) => a + s.price, 0);
    const totalPendente = services.filter((s) => s.payment === "pendente").reduce((a, s) => a + s.price, 0);
    const servicosAbertos = services.filter((s) => s.status !== "concluido").length;
    return { totalRecebido, totalAdiantado, totalPendente, servicosAbertos };
  }, [services]);

  const upcoming = services.filter((s) => s.status !== "concluido").slice(0, 5);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <PageHeader
        title="Olá 👋"
        description="Aqui está o resumo da sua oficina hoje."
        action={
          <Button mode="contained" icon="plus" onPress={() => router.push("/servico/novo")}>
            Nova OS
          </Button>
        }
      />

      <View style={styles.kpiGrid}>
        <View style={styles.kpiHalf}>
          <StatCard
            label="Caixa da oficina"
            value={formatBRL(financialSummary.totalRecebido)}
            hint="Valores já pagos"
            variant="gold"
            icon={<MaterialCommunityIcons name="cash" size={22} color="#B8860B" />}
          />
        </View>
        <View style={styles.kpiHalf}>
          <StatCard
            label="Adiantado"
            value={formatBRL(financialSummary.totalAdiantado)}
            hint="A executar"
            variant="primary"
            icon={<MaterialCommunityIcons name="trending-up" size={22} color={theme.colors.primary} />}
          />
        </View>
        <View style={styles.kpiHalf}>
          <StatCard
            label="A receber"
            value={formatBRL(financialSummary.totalPendente)}
            hint="Pagamentos pendentes"
            variant="warning"
            icon={<MaterialCommunityIcons name="clock-outline" size={22} color="#E65100" />}
          />
        </View>
        <View style={styles.kpiHalf}>
          <StatCard
            label="OS abertas"
            value={financialSummary.servicosAbertos}
            hint={`${clients.length} clientes · ${cars.length} carros`}
            variant="default"
            icon={<MaterialCommunityIcons name="wrench" size={22} color={theme.colors.onSurfaceVariant} />}
          />
        </View>
      </View>

      <View style={styles.blockRow}>
        <Card mode="outlined" style={[styles.mainCard, { borderColor: theme.colors.outlineVariant }]}>
          <Card.Title title="Próximos serviços" />
          <Card.Content style={{ gap: 10 }}>
            {upcoming.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => router.push(`/servico/${s.id}`)}
                style={({ pressed }) => [
                  styles.serviceRow,
                  { borderColor: theme.colors.outlineVariant, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <View style={styles.serviceText}>
                  <Text variant="titleSmall" numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                    {s.client?.name ?? "-"} · {(s.car && `${s.car.model} — ${s.car.plate}`) || "-"}
                  </Text>
                </View>
                <View style={styles.badges}>
                  <ServiceStatusBadge status={s.status} />
                  <PaymentBadge status={s.payment} />
                  <Text variant="titleSmall" style={{ color: "#B8860B", marginLeft: 4 }}>
                    {formatBRL(s.price)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push("/services")}>Ver serviços</Button>
          </Card.Actions>
        </Card>

        <Card mode="outlined" style={[styles.sideCard, { borderColor: theme.colors.outlineVariant }]}>
          <Card.Title title="Atalhos" />
          <Card.Content style={styles.shortcuts}>
            <ShortcutTile
              icon="account-plus"
              label="Novo cliente"
              onPress={() => router.push("/cliente/novo")}
              theme={theme}
            />
            <ShortcutTile
              icon="car-outline"
              label="Novo carro"
              onPress={() => router.push("/carro/novo")}
              theme={theme}
            />
            <ShortcutTile
              icon="file-document-plus"
              label="Nova OS"
              onPress={() => router.push("/servico/novo")}
              theme={theme}
            />
            <ShortcutTile
              icon="bank"
              label="Financeiro"
              onPress={() => router.push("/financeiro")}
              theme={theme}
            />
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

type MciName = ComponentProps<typeof MaterialCommunityIcons>["name"];

function ShortcutTile({
  icon,
  label,
  onPress,
  theme,
}: {
  icon: MciName;
  label: string;
  onPress: () => void;
  theme: MD3Theme;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.shortcut, { borderColor: theme.colors.outlineVariant, opacity: pressed ? 0.9 : 1 }]}>
      <View style={[styles.shortcutIcon, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name={icon} size={22} color={theme.colors.onPrimaryContainer} />
      </View>
      <Text variant="labelLarge">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  kpiHalf: {
    width: "48%",
    flexGrow: 1,
    minWidth: 140,
  },
  blockRow: {
    gap: 12,
  },
  mainCard: {
    width: "100%",
  },
  sideCard: {
    width: "100%",
  },
  serviceRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  serviceText: {
    minWidth: 0,
    gap: 4,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  shortcuts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  shortcut: {
    width: "47%",
    minWidth: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
