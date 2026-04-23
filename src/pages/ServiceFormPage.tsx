import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Menu, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, type Car, type PaymentStatus, type Service, type ServiceStatus } from "@/lib/api";
import { PageHeader } from "@/src/components/shared/PageHeader";

export interface ServiceFormPageProps {
  serviceId?: string;
}

export const statusLabels: Record<ServiceStatus, string> = {
  a_fazer: "A fazer",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  aguardando_peca: "Aguardando peça",
  cancelado: "Cancelado",
};

export const statusColor: Record<ServiceStatus, string> = {
  a_fazer: "#F59E0B",
  em_andamento: "#3B82F6",
  concluido: "#22C55E",
  aguardando_peca: "#A855F7",
  cancelado: "#EF4444",
};

export const paymentLabels: Record<PaymentStatus, string> = {
  pendente: "Pendente",
  adiantado: "Adiantado",
  pago: "Pago",
};

export const paymentColor: Record<PaymentStatus, string> = {
  pendente: "#EF4444",
  adiantado: "#3B82F6",
  pago: "#22C55E",
};

const formatDateBR = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
};

const parseDateBRToIso = (value: string): string | null => {
  const m = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const iso = `${yyyy}-${mm}-${dd}T00:00:00`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

export default function ServiceFormPage({ serviceId }: ServiceFormPageProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const editing = Boolean(serviceId);
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [carId, setCarId] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<ServiceStatus>("em_andamento");
  const [payment, setPayment] = useState<PaymentStatus>("pendente");
  const [entryDate, setEntryDate] = useState(formatDateBR(new Date().toISOString()));
  const [dueDate, setDueDate] = useState("");

  const [carMenu, setCarMenu] = useState(false);
  const [statusMenu, setStatusMenu] = useState(false);
  const [payMenu, setPayMenu] = useState(false);
  const [snack, setSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");

  useEffect(() => {
    api
      .getCars()
      .then((data) => {
        setCars(data);
      })
      .catch(() => setCars([]));
    api.getServices().then(setServices).catch(() => setServices([]));
  }, [serviceId]);

  useEffect(() => {
    if (!serviceId || services.length === 0) return;
    const existing = services.find((s) => s.id === serviceId);
    if (!existing) return;
    setTitle(existing.title);
    setDescription(existing.description);
    setCarId(existing.carId);
    setPrice(String(existing.price));
    setStatus(existing.status);
    setPayment(existing.payment);
    setEntryDate(formatDateBR(existing.createdAt));
    setDueDate(formatDateBR(existing.dueDate));
    setAdvanceAmount(String(existing.advanceAmount ?? 0));
  }, [serviceId, services]);

  const carLabel = useMemo(() => {
    const c = cars.find((x) => x.id === carId);
    return c ? `${c.model} — ${c.plate} (${c.client?.name ?? "-"})` : "Selecionar Carro";
  }, [carId, cars]);

  const submit = async () => {
    if (saving) return;
    if (!cars.length) {
      setSnackMsg("Nenhum carro cadastrado. Por favor, cadastre um carro primeiro.");
      setSnack(true);
      return;
    }
    if (!title.trim()) {
      setSnackMsg("Informe o nome do serviço.");
      setSnack(true);
      return;
    }
    if (!dueDate.trim()) {
      setSnackMsg("Informe a previsão no formato DD/MM/AAAA.");
      setSnack(true);
      return;
    }
    const dueDateIso = parseDateBRToIso(dueDate);
    if (!dueDateIso) {
      setSnackMsg("Data inválida. Use o formato DD/MM/AAAA.");
      setSnack(true);
      return;
    }
    const parsedPrice = Number(String(price).replace(",", "."));
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setSnackMsg("Informe um valor válido.");
      setSnack(true);
      return;
    }
    setSaving(true);
    try {
      const selectedCar = cars.find((car) => car.id === carId);
      if (!selectedCar) {
        setSnackMsg("Selecione um carro.");
        setSnack(true);
        return;
      }
      const payload = {
        title: title.trim(),
        description: description.trim(),
        carId,
        clientId: selectedCar.clientId,
        status,
        payment,
        price: parsedPrice,
        advanceAmount: payment === "adiantado" ? Number(String(advanceAmount).replace(",", ".")) || 0 : 0,
        dueDate: dueDateIso,
      };
      if (editing && serviceId) {
        await api.updateService(serviceId, payload);
        setSnackMsg("Serviço atualizado com sucesso.");
      } else {
        await api.createService(payload);
        setSnackMsg("Serviço cadastrado com sucesso.");
        router.replace("/services");
        return;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/\[invalid_car\]/.test(msg)) {
        setSnackMsg("Carro inválido. Cadastre ou selecione outro carro.");
      } else if (/\[invalid_client\]/.test(msg)) {
        setSnackMsg("Cliente inválido para o carro selecionado.");
      } else {
        setSnackMsg("Erro ao salvar serviço. Verifique a API e tente novamente.");
      }
    } finally {
      setSaving(false);
      setSnack(true);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          contentContainerStyle={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Button mode="text" icon="arrow-left" onPress={() => router.back()} style={{ alignSelf: "flex-start" }}>
            Voltar
          </Button>

          <PageHeader
            title={editing ? "Editar serviço" : "Nova ordem de serviço"}
            description="Defina o serviço, valor e status de pagamento."
          />

          <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
            <Card.Content style={{ gap: 16, paddingTop: 16 }}>
              <TextInput mode="outlined" label="Serviço" placeholder="Ex: Troca de óleo + filtros" value={title} onChangeText={setTitle} />
              <TextInput mode="outlined" label="Descrição" placeholder="Detalhes, peças, observações..." value={description} onChangeText={setDescription} multiline numberOfLines={4} />
              <TextInput mode="outlined" label="Entrada (DD/MM/AAAA)" value={entryDate} editable={false} />
              <Text variant="labelLarge">Carro</Text>
              {cars.length === 0 ? (
                <View style={styles.warningBox}>
                  <Text variant="bodyMedium">Por favor, cadastre um carro antes de criar uma OS.</Text>
                  <Button mode="outlined" onPress={() => router.push("/carro/novo")}>
                    Cadastrar carro
                  </Button>
                </View>
              ) : (
                <Menu visible={carMenu} onDismiss={() => setCarMenu(false)} anchor={<Button mode="outlined" onPress={() => setCarMenu(true)}>{carLabel}</Button>}>
                  {cars.map((c) => (
                    <Menu.Item
                      key={c.id}
                      onPress={() => {
                        setCarId(c.id);
                        setCarMenu(false);
                      }}
                      title={`${c.model} — ${c.plate}`}
                    />
                  ))}
                </Menu>
              )}

              <TextInput mode="outlined" label="Valor (R$)" placeholder="0" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

              <Text variant="labelLarge">Status do serviço</Text>
              <Menu visible={statusMenu} onDismiss={() => setStatusMenu(false)} anchor={
                <Button
                  mode="outlined"
                  onPress={() => setStatusMenu(true)}
                  style={{ borderColor: statusColor[status] }}
                  textColor={statusColor[status]}
                >
                  {statusLabels[status]}
                </Button>
              }>
                {(Object.keys(statusLabels) as ServiceStatus[]).map((k) => (
                  <Menu.Item key={k} onPress={() => { setStatus(k); setStatusMenu(false); }} title={statusLabels[k]} />
                ))}
              </Menu>

              <Text variant="labelLarge">Pagamento</Text>
              <Menu visible={payMenu} onDismiss={() => setPayMenu(false)} anchor={
                <Button
                  mode="outlined"
                  onPress={() => setPayMenu(true)}
                  style={{ borderColor: paymentColor[payment] }}
                  textColor={paymentColor[payment]}
                >
                  {paymentLabels[payment]}
                </Button>
              }>
                {(Object.keys(paymentLabels) as PaymentStatus[]).map((k) => (
                  <Menu.Item key={k} onPress={() => { setPayment(k); setPayMenu(false); }} title={paymentLabels[k]} />
                ))}
              </Menu>

              
              {payment === "adiantado" && (
                <TextInput
                  mode="outlined"
                  label="Valor adiantado (R$)"
                  placeholder="0"
                  value={advanceAmount}
                  onChangeText={setAdvanceAmount}
                  keyboardType="decimal-pad"
                />
              )}

              <TextInput
                mode="outlined"
                label="Previsão (DD/MM/AAAA)"
                placeholder="20/04/2026"
                value={dueDate}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "");
                  let masked = cleaned;
                  if (cleaned.length > 2) masked = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
                  if (cleaned.length > 4) masked = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4) + "/" + cleaned.slice(4, 8);
                  setDueDate(masked);
                }}
                keyboardType="number-pad"
                maxLength={10}
              />

              <View style={styles.actions}>
                <Button mode="contained" icon="content-save" onPress={submit} loading={saving} disabled={saving || cars.length === 0}>
                  {editing ? "Salvar alterações" : "Cadastrar OS"}
                </Button>
                {editing ? (
                  <Button
                    mode="outlined"
                    textColor={theme.colors.error}
                    icon="delete"
                    onPress={async () => {
                      try {
                        if (!serviceId) return;
                        await api.deleteService(serviceId);
                        setSnackMsg("Serviço excluído com sucesso.");
                        setSnack(true);
                        router.back();
                      } catch {
                        setSnackMsg("Erro ao excluir serviço.");
                        setSnack(true);
                      }
                    }}
                  >
                    Excluir
                  </Button>
                ) : null}
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={2000}>
        {snackMsg}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
  actions: {
    gap: 8,
    marginTop: 8,
  },
  warningBox: {
    gap: 8,
  },
});
