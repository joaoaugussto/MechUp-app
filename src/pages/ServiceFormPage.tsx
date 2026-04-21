import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Menu, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, type Car, type PaymentStatus, type Service, type ServiceStatus } from "@/lib/api";
import { PageHeader } from "@/src/components/shared/PageHeader";

export interface ServiceFormPageProps {
  serviceId?: string;
}

const statusLabels: Record<ServiceStatus, string> = {
  a_fazer: "A fazer",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

const paymentLabels: Record<PaymentStatus, string> = {
  pendente: "Pendente",
  adiantado: "Adiantado",
  pago: "Pago",
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
  const [status, setStatus] = useState<ServiceStatus>("a_fazer");
  const [payment, setPayment] = useState<PaymentStatus>("pendente");
  const [dueDate, setDueDate] = useState("");

  const [carMenu, setCarMenu] = useState(false);
  const [statusMenu, setStatusMenu] = useState(false);
  const [payMenu, setPayMenu] = useState(false);
  const [snack, setSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  useEffect(() => {
    api.getCars().then((data) => {
      setCars(data);
      if (!serviceId && data[0]) setCarId(data[0].id);
    });
    api.getServices().then(setServices);
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
    setDueDate(existing.dueDate.slice(0, 10));
  }, [serviceId, services]);

  const carLabel = useMemo(() => {
    const c = cars.find((x) => x.id === carId);
    return c ? `${c.model} — ${c.plate} (${c.client?.name ?? "-"})` : "Selecione um carro";
  }, [carId, cars]);

  const submit = async () => {
    try {
      const selectedCar = cars.find((car) => car.id === carId);
      if (!selectedCar) {
        setSnackMsg("Selecione um carro.");
        setSnack(true);
        return;
      }
      const payload = {
        title,
        description,
        carId,
        clientId: selectedCar.clientId,
        status,
        payment,
        price: Number(price),
        dueDate,
      };
      if (editing && serviceId) {
        await api.updateService(serviceId, payload);
        setSnackMsg("Serviço atualizado com sucesso.");
      } else {
        await api.createService(payload);
        setSnackMsg("Serviço cadastrado com sucesso.");
      }
    } catch {
      setSnackMsg("Erro ao salvar serviço. Verifique a API e tente novamente.");
    } finally {
      setSnack(true);
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
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

            <Text variant="labelLarge">Carro</Text>
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

            <TextInput mode="outlined" label="Valor (R$)" placeholder="0" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

            <Text variant="labelLarge">Status do serviço</Text>
            <Menu visible={statusMenu} onDismiss={() => setStatusMenu(false)} anchor={<Button mode="outlined" onPress={() => setStatusMenu(true)}>{statusLabels[status]}</Button>}>
              {(Object.keys(statusLabels) as ServiceStatus[]).map((k) => (
                <Menu.Item key={k} onPress={() => { setStatus(k); setStatusMenu(false); }} title={statusLabels[k]} />
              ))}
            </Menu>

            <Text variant="labelLarge">Pagamento</Text>
            <Menu visible={payMenu} onDismiss={() => setPayMenu(false)} anchor={<Button mode="outlined" onPress={() => setPayMenu(true)}>{paymentLabels[payment]}</Button>}>
              {(Object.keys(paymentLabels) as PaymentStatus[]).map((k) => (
                <Menu.Item key={k} onPress={() => { setPayment(k); setPayMenu(false); }} title={paymentLabels[k]} />
              ))}
            </Menu>

            <TextInput mode="outlined" label="Previsão (AAAA-MM-DD)" placeholder="2026-04-22" value={dueDate} onChangeText={setDueDate} />

            <View style={styles.actions}>
              <Button mode="contained" icon="content-save" onPress={submit}>
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
});
