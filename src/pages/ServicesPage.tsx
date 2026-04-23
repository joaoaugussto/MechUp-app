import { api, formatBRL, type Service, type ServiceStatus } from "@/lib/api";
import { paymentColor, paymentLabels } from "@/src/pages/ServiceFormPage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Linking, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { Button, Card, Menu, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const statusColor: Record<ServiceStatus, string> = {
  a_fazer: "#F59E0B",
  em_andamento: "#3B82F6",
  concluido: "#22C55E",
  aguardando_peca: "#A855F7",
  cancelado: "#EF4444",
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
  const [whatsConfirm, setWhatsConfirm] = useState<Service | null>(null);

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
        advanceAmount: service.advanceAmount,
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
    const phone = service.client?.phone?.replace(/\D/g, "") ?? "";
    const message =
      `Status da OS\n\n` +
      `Cliente: ${service.client?.name ?? "-"}\n` +
      `Veículo: ${service.car?.model ?? "-"} - ${service.car?.plate ?? "-"}\n` +
      `Serviço: ${service.title}\n` +
      `Status: ${statusLabel[service.status]}\n` +
      `Previsão: ${new Date(service.dueDate).toLocaleDateString("pt-BR")}\n` +
      `Valor: ${formatBRL(service.price)}`;
    try {
      const url = phone
        ? `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/?text=${encodeURIComponent(message)}`;
      await Linking.openURL(url);
    } catch {
      setSnack("Não foi possível abrir o WhatsApp.");
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
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
            placeholder="Procurar Serviço"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            outlineStyle={{ borderRadius: 24 }}
            left={<TextInput.Icon icon="magnify" size={18} />}
            dense
          />
          <Menu
            visible={filterMenuOpen}
            onDismiss={() => setFilterMenuOpen(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setFilterMenuOpen(true)}
                style={[styles.filterButton, { borderColor: filter === "todos" ? theme.colors.outline : statusColor[filter as ServiceStatus] }]}
                textColor={filter === "todos" ? theme.colors.onSurface : statusColor[filter as ServiceStatus]}
              >
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
            <Card key={s.id} mode="outlined" style={{
              borderColor: theme.colors.outlineVariant,
              borderLeftColor: statusColor[s.status], borderLeftWidth: 4, overflow: "hidden"
            }}>
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
                          style={[styles.statusTag, { borderColor: statusColor[s.status] }]}
                          textColor={statusColor[s.status]}
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

                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    descrição: {s.description}
                  </Text>

                  <Text variant="bodySmall">
                    Pagamento: <Text style={{ color: paymentColor[s.payment] }}>{paymentLabels[s.payment]}</Text>
                  </Text>
                </View>

                <View style={[styles.midCol, compactCard && styles.midColCompact]}>
                  <View style={styles.datesRow}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={styles.dateItem}>
                        <MaterialCommunityIcons name="calendar-arrow-right" size={14} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                        </Text>
                      </View>
                      <View style={styles.dateItem}>
                        <MaterialCommunityIcons name="calendar-check" size={14} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {new Date(s.dueDate).toLocaleDateString("pt-BR")}
                        </Text>
                      </View>
                    </View>
                    <Button mode="outlined" compact onPress={() => router.push(`/servico/${s.id}`)} style={styles.editButton}>
                      Editar
                    </Button>
                  </View>
                  <Text variant="titleLarge" style={styles.price}>
                    {formatBRL(s.price)}
                  </Text>

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

                <View style={[styles.rightCol, compactCard && styles.rightColCompact]}>
                  <Button
                    mode="contained"
                    icon="whatsapp"
                    buttonColor="#25D366"
                    textColor="#ffffff"
                    onPress={() => setWhatsConfirm(s)}
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

      {whatsConfirm && (
        <View style={styles.overlay}>
          <Card style={styles.confirmCard}>
            <Card.Content style={{ gap: 12 }}>
              <Text variant="titleMedium">Enviar OS pelo WhatsApp?</Text>
              <Text variant="bodyMedium" style={{ color: "#888" }}>
                Enviando para {whatsConfirm.client?.name ?? "cliente"} ({whatsConfirm.client?.phone ?? "sem telefone"})
              </Text>
              <Button
                mode="contained"
                icon="whatsapp"
                buttonColor="#25D366"
                textColor="#fff"
                onPress={() => {
                  void sendStatusWhatsApp(whatsConfirm);
                  setWhatsConfirm(null);
                }}
              >
                Sim, enviar
              </Button>
              <Button mode="outlined" onPress={() => setWhatsConfirm(null)}>
                Cancelar
              </Button>
            </Card.Content>
          </Card>
        </View>
      )}
    </>
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
    gap: 8,
    alignItems: "center",
  },
  searchInput: {
    flex: 2,
    height: 44,
    fontSize: 13,
  },
  advanceBox: {
    gap: 2,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  searchInputCompact: {
    minWidth: "100%",
    maxWidth: 9999,
  },
  filterButton: {
    justifyContent: "center",
    alignSelf: "center",
    flexShrink: 0,
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
    paddingLeft: 12,
  },
  cardContentCompact: {
    flexDirection: "column",
  },
  statusBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
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
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 99,
  },
  confirmCard: {
    borderRadius: 16,
  },
});
