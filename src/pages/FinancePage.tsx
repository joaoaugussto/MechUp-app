import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Divider, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, formatBRL, type Service } from "@/lib/api";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { StatCard } from "@/src/components/shared/StatCard";
import { paymentColor, paymentLabels } from "@/src/pages/ServiceFormPage";

export default function FinancePage() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState<Service[]>([]);

  useFocusEffect(
    useCallback(() => {
      api.getServices().then(setServices).catch(() => setServices([]));
    }, [])
  );

  const financialSummary = useMemo(() => {
    const totalRecebido = services.filter((s) => s.payment === "pago" || s.status === "concluido").reduce((a, s) => a + s.price, 0);
    const totalAdiantado = services.filter((s) => s.payment === "adiantado" && s.status !== "concluido").reduce((a, s) => a + (s.advanceAmount ?? 0), 0);
    const totalPendente = services.filter((s) => s.status !== "concluido" && s.payment !== "pago").reduce((a, s) => {
      const restante = s.price - (s.advanceAmount ?? 0);
      return a + (restante > 0 ? restante : 0);
    }, 0);
    return { totalRecebido, totalAdiantado, totalPendente };
  }, [services]);

  const total = financialSummary.totalRecebido + financialSummary.totalAdiantado;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
    >
      <PageHeader title="Financeiro" description="Acompanhe o caixa, adiantamentos e pendências." />

      <View style={styles.kpiGrid}>
        <View style={styles.kpiHalf}>
          <StatCard label="Caixa total" value={formatBRL(total)} hint="Recebido + adiantado" variant="gold"
            icon={<MaterialCommunityIcons name="wallet" size={22} color="#B8860B" />} />
        </View>
        <View style={styles.kpiHalf}>
          <StatCard label="Já recebido" value={formatBRL(financialSummary.totalRecebido)} variant="success"
            icon={<MaterialCommunityIcons name="cash-check" size={22} color={theme.colors.tertiary ?? "#2E7D32"} />} />
        </View>
        <View style={styles.kpiHalf}>
          <StatCard label="Adiantado" value={formatBRL(financialSummary.totalAdiantado)} hint="Serviços a executar" variant="primary"
            icon={<MaterialCommunityIcons name="trending-up" size={22} color={theme.colors.primary} />} />
        </View>
        <View style={styles.kpiHalf}>
          <StatCard label="A receber" value={formatBRL(financialSummary.totalPendente)} variant="warning"
            icon={<MaterialCommunityIcons name="clock-outline" size={22} color="#E65100" />} />
        </View>
      </View>

      <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
        <Card.Title title="Pagamentos por cliente" />
        <Card.Content style={{ paddingHorizontal: 0 }}>
          {services.map((s, index) => (
            <View key={s.id}>
              {index > 0 ? <Divider style={{ marginVertical: 4 }} /> : null}
              <View style={styles.row}>
                <View style={{ flex: 1, minWidth: 0, paddingHorizontal: 16, gap: 4 }}>
                  <Text variant="titleSmall" numberOfLines={1}>
                    {s.client?.name ?? "-"}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                    {(s.car && `${s.car.model} — ${s.car.plate}`) || "-"}
                  </Text>

                  {/* Pagamento com cor */}
                  <Text variant="bodySmall" style={{ marginTop: 4 }}>
                    Pagamento: <Text style={{ color: paymentColor[s.payment] }}>{paymentLabels[s.payment]}</Text>
                  </Text>

                  {/* Adiantado e restante */}
                  {s.payment === "adiantado" && s.advanceAmount > 0 && (
                    <View style={styles.advanceBox}>
                      <Text variant="bodySmall" style={{ color: "#3B82F6" }}>
                        Adiantado: {formatBRL(s.advanceAmount)}
                      </Text>
                      <Text variant="bodySmall" style={{ color: "#EF4444" }}>
                        Restante: {formatBRL(s.price - s.advanceAmount)}
                      </Text>
                    </View>
                  )}
                </View>
                <Text variant="titleSmall" style={{ color: "#B8860B", paddingRight: 16, alignSelf: "flex-start" }}>
                  {formatBRL(s.price)}
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16
  },
  kpiGrid: {
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 12
  },
  kpiHalf: { 
    width: "48%", 
    flexGrow: 1,
    minWidth: 140
   },
  row: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    paddingVertical: 8, 
    gap: 8
   },
  advanceBox: { 
    gap: 2, 
    marginTop: 4, 
    paddingTop: 4, 
    borderTopWidth: 1, 
    borderTopColor: "#2A2A2A" 
  },
});