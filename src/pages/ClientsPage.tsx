import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, IconButton, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, type Client } from "@/lib/api";
import { PageHeader } from "@/src/components/shared/PageHeader";

export default function ClientsPage() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    api.getClients().then(setClients).catch(() => setClients([]));
  }, []);

  const filtered = clients.map((c) => ({ ...c, carsCount: c.cars?.length ?? 0 })).filter(
    (c) =>
      c.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      c.phone.replace(/\D/g, "").includes(query.replace(/\D/g, "")),
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <PageHeader
        title="Clientes"
        description="Gerencie todos os clientes da sua oficina."
        action={
          <Button mode="contained" icon="account-plus" onPress={() => router.push("/cliente/novo")}>
            Novo cliente
          </Button>
        }
      />

      <TextInput
        mode="outlined"
        placeholder="Buscar por nome ou telefone..."
        value={query}
        onChangeText={setQuery}
        left={<TextInput.Icon icon="magnify" />}
        style={styles.search}
      />

      <View style={styles.list}>
        {filtered.map((c) => (
          <Card key={c.id} mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
            <Card.Content style={styles.cardRow}>
              <View style={styles.cardMain}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                    {c.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.cardText}>
                  <Text variant="titleSmall" numberOfLines={1}>
                    {c.name}
                  </Text>
                  <View style={styles.phoneRow}>
                    <MaterialCommunityIcons name="phone" size={14} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {c.phone}
                    </Text>
                  </View>
                  <View style={styles.phoneRow}>
                    <MaterialCommunityIcons name="car" size={14} color="#B8860B" />
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {c.carsCount} {c.carsCount === 1 ? "veículo" : "veículos"}
                    </Text>
                  </View>
                </View>
              </View>
              <IconButton icon="pencil" mode="outlined" onPress={() => router.push(`/cliente/${c.id}`)} />
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  search: {
    marginBottom: 4,
  },
  list: {
    gap: 12,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
