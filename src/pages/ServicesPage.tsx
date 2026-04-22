import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Linking, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { Button, Card, Menu, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, formatBRL, type Service, type ServiceStatus } from "@/lib/api";

type Filter = "todos" | ServiceStatus;
const filterLabel: Record<Filter, string> = {
  todos: "Todos os Status",
  a_fazer: "A Fazer",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  aguardando_peca: "Aguardando peça",
  cancelado: "Cancelado",
};
const statusLabel: Record<ServiceStatus, string> = {
  a_fazer: "A Fazer",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  aguardando_peca: "Aguardando peça",
  cancelado: "Cancelado",
};

export default function ServicesPage() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compactCard = width < 860;
  const [filter, setFilter] = useState<Filter>("todos");
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [statusMenuFor, setStatusMenuFor] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [snack, setSnack] = useState("");

  const loadServices = useCallback(async () => {
    try {
      const data = await api.getServices();
      setServices(data);
    } catch {
      setServices([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadServices();
    }, [loadServices]),
  );

  const normalizedQuery = query.trim().toLowerCase();
  const list = services.filter((s) => {
    const matchesStatus = filter === "todos" ? true : s.status === filter;
    if (!normalizedQuery) return matchesStatus;
    const haystack = [s.car?.plate ?? "", s.client?.name ?? "", s.title ?? "", s.description ?? ""].join(" ").toLowerCase();
    return matchesStatus && haystack.includes(normalizedQuery);
  });

  const changeStatus = async (service: Service, next: ServiceStatus) => {
    if (updatingStatusId) return;
    setUpdatingStatusId(service.id);
    try {
      await api.updateService(service.id, {
        title: service.title,
        description: service.description,
        status: next,
        payment: service.payment,
        price: service.price,
        dueDate: service.dueDate,
        carId: service.carId,
        clientId: service.clientId,
      });
      setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, status: next } : s)));
    } finally {
      setUpdatingStatusId(null);
      setStatusMenuFor(null);
    }
  };

  const sendStatusWhatsApp = async (service: Service) => {
    const message =
      `Status da OS\n\n` +
      `Cliente: ${service.client?.name ?? "-"}\n` +
      `Veículo: ${(service.car?.model ?? "-")} - ${(service.car?.plate ?? "-")}\n` +
      `Serviço: ${service.title}\n` +
      `Status: ${statusLabel[service.status]}\n` +
      `Previsão: ${new Date(service.dueDate).toLocaleDateString("pt-BR")}\n` +
      `Valor: ${formatBRL(service.price)}`;
    try {
      await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
    } catch {
      setSnack("Não foi possível abrir o WhatsApp.");
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall">Ordens de Serviço</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {services.length} ordens registradas
          </Text>
        </View>
        <Button
          mode="contained"
          compact
          icon="plus"
          onPress={() => router.push("/servico/novo")}
          style={styles.newButtonSmall}
        >
          Nova Ordem
        </Button>
      </View>

      <View style={styles.filtersRow}>
        <TextInput
          mode="outlined"
          placeholder="Buscar placa/cliente/serviço..."
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, compactCard && styles.searchInputCompact]}
        />
        <Menu
          visible={filterMenuOpen}
          onDismiss={() => setFilterMenuOpen(false)}
          anchor={
            <Button mode="outlined" onPress={() => setFilterMenuOpen(true)} style={[styles.filterButton, compactCard && styles.filterButtonCompact]}>
              {filterLabel[filter]}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setFilter("todos"); setFilterMenuOpen(false); }} title={filterLabel.todos} />
          <Menu.Item onPress={() => { setFilter("a_fazer"); setFilterMenuOpen(false); }} title={filterLabel.a_fazer} />
          <Menu.Item onPress={() => { setFilter("em_andamento"); setFilterMenuOpen(false); }} title={filterLabel.em_andamento} />
          <Menu.Item onPress={() => { setFilter("aguardando_peca"); setFilterMenuOpen(false); }} title={filterLabel.aguardando_peca} />
          <Menu.Item onPress={() => { setFilter("concluido"); setFilterMenuOpen(false); }} title={filterLabel.concluido} />
          <Menu.Item onPress={() => { setFilter("cancelado"); setFilterMenuOpen(false); }} title={filterLabel.cancelado} />
        </Menu>
      </View>

      <View style={styles.list}>
        {list.map((s) => (
          <Card key={s.id} mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
            <Card.Content style={[styles.cardContent, compactCard && styles.cardContentCompact]}>
              <View style={styles.leftCol}>
                <View style={styles.titleRow}>
                    <Text variant="titleSmall" style={{ flex: 1 }}>
                    {(s.car?.model ?? "Sem carro")} - {s.car?.plate ?? "-"}
                  </Text>
                    <Menu
                      visible={statusMenuFor === s.id}
                      onDismiss={() => setStatusMenuFor(null)}
                      anchor={
                        <Button
                          mode="outlined"
                          compact
                          onPress={() => setStatusMenuFor(s.id)}
                          loading={updatingStatusId === s.id}
                          disabled={updatingStatusId === s.id}
                          style={styles.statusTag}
                        >
                          {statusLabel[s.status]}
                        </Button>
                      }
                    >
                      <Menu.Item onPress={() => void changeStatus(s, "a_fazer")} title={statusLabel.a_fazer} />
                      <Menu.Item onPress={() => void changeStatus(s, "em_andamento")} title={statusLabel.em_andamento} />
                      <Menu.Item onPress={() => void changeStatus(s, "aguardando_peca")} title={statusLabel.aguardando_peca} />
                      <Menu.Item onPress={() => void changeStatus(s, "concluido")} title={statusLabel.concluido} />
                      <Menu.Item onPress={() => void changeStatus(s, "cancelado")} title={statusLabel.cancelado} />
                    </Menu>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Cliente: {s.client?.name ?? "-"}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Serviço: {s.title}
                </Text>
              </View>

              <View style={[styles.midCol, compactCard && styles.midColCompact]}>
                <View style={styles.datesRow}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Entrada: {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Saída: {new Date(s.dueDate).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                  <Button mode="outlined" compact onPress={() => router.push(`/servico/${s.id}`)} style={styles.editButton}>
                    Editar
                  </Button>
                </View>
                <Text variant="titleSmall" style={styles.price}>
                  {formatBRL(s.price)}
                </Text>
              </View>

              <View style={[styles.rightCol, compactCard && styles.rightColCompact]}>
                <Button
                  mode="contained"
                  icon="whatsapp"
                  buttonColor="#25D366"
                  textColor="#ffffff"
                  onPress={() => void sendStatusWhatsApp(s)}
                  style={styles.whatsButton}
                  compact
                >
                  Enviar Status
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
        {list.length === 0 ? (
          <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
            <Card.Content>
              <Text variant="bodyMedium">Nenhuma ordem encontrada para os filtros atuais.</Text>
            </Card.Content>
          </Card>
        ) : null}
      </View>
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack("")} duration={2600}>
        {snack}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  newButtonSmall: {
    alignSelf: "flex-start",
  },
  filtersRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: 260,
    maxWidth: 520,
  },
  searchInputCompact: {
    minWidth: "100%",
    maxWidth: 9999,
  },
  filterButton: {
    minWidth: 180,
  },
  filterButtonCompact: {
    minWidth: 180,
  },
  list: {
    gap: 12,
  },
  cardContent: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  cardContentCompact: {
    flexDirection: "column",
  },
  leftCol: {
    flex: 2,
    gap: 4,
    minWidth: 0,
    flexShrink: 1,
  },
  titleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
  },
  statusTag: {
    minWidth: 160,
    alignSelf: "flex-end",
  },
  editButton: {
    minWidth: 160,
    alignSelf: "flex-end",
  },
  midCol: {
    flex: 1,
    gap: 4,
    minWidth: 0,
    alignItems: "flex-start",
  },
  datesRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  midColCompact: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
    paddingTop: 8,
  },
  rightCol: {
    gap: 8,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  rightColCompact: {
    width: "100%",
    alignItems: "flex-start",
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
    paddingTop: 8,
  },
  whatsButton: {
    alignSelf: "stretch",
  },
  price: {
    color: "#B8860B",
  },
});
