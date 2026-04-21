import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, IconButton, SegmentedButtons, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/src/components/shared/EmptyState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { PaymentBadge, ServiceStatusBadge } from "@/src/components/shared/StatusBadges";
import { formatBRL, mockServices, type ServiceStatus } from "@/lib/mock-data";

type Filter = "todos" | ServiceStatus;

export default function ServicesPage() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>("a_fazer");

  const list = filter === "todos" ? mockServices : mockServices.filter((s) => s.status === filter);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <PageHeader
        title="Serviços"
        description="Ordens de serviço da oficina."
        action={
          <Button mode="contained" icon="plus" onPress={() => router.push("/servico/novo")}>
            Nova OS
          </Button>
        }
      />

      <SegmentedButtons
        value={filter}
        onValueChange={(v) => setFilter(v as Filter)}
        buttons={[
          { value: "a_fazer", label: "A fazer" },
          { value: "em_andamento", label: "Andamento" },
          { value: "concluido", label: "Concluídos" },
          { value: "todos", label: "Todos" },
        ]}
        style={styles.segment}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<MaterialCommunityIcons name="wrench" size={28} color={theme.colors.onSurfaceVariant} />}
          title="Nenhuma OS nesta lista"
          description="Cadastre uma nova ordem de serviço para começar."
          action={
            <Button mode="contained" icon="plus" onPress={() => router.push("/servico/novo")}>
              Nova OS
            </Button>
          }
        />
      ) : (
        <View style={{ gap: 12 }}>
          {list.map((s) => (
            <Card key={s.id} mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
              <Card.Content style={styles.serviceCard}>
                <View style={styles.serviceLeft}>
                  <View style={[styles.wrenchBox, { backgroundColor: theme.colors.primaryContainer }]}>
                    <MaterialCommunityIcons name="wrench" size={22} color={theme.colors.onPrimaryContainer} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="titleSmall" numberOfLines={1}>
                      {s.title}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                      {s.clientName} · {s.carLabel}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                      Vence: {new Date(s.dueDate).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                </View>
                <View style={styles.serviceRight}>
                  <ServiceStatusBadge status={s.status} />
                  <PaymentBadge status={s.payment} />
                  <Text variant="titleSmall" style={{ color: "#B8860B" }}>
                    {formatBRL(s.price)}
                  </Text>
                  <IconButton icon="pencil" mode="outlined" onPress={() => router.push(`/servico/${s.id}`)} />
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  segment: {
    marginBottom: 4,
  },
  serviceCard: {
    gap: 12,
  },
  serviceLeft: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  wrenchBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceRight: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
});
