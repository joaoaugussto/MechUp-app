import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Menu, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PageHeader } from "@/src/components/shared/PageHeader";
import { mockCars, mockServices, type PaymentStatus, type ServiceStatus } from "@/lib/mock-data";

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
  const existing = editing ? mockServices.find((s) => s.id === serviceId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [carId, setCarId] = useState(existing?.carId ?? mockCars[0]?.id ?? "");
  const [price, setPrice] = useState(existing ? String(existing.price) : "");
  const [status, setStatus] = useState<ServiceStatus>(existing?.status ?? "a_fazer");
  const [payment, setPayment] = useState<PaymentStatus>(existing?.payment ?? "pendente");
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? "");

  const [carMenu, setCarMenu] = useState(false);
  const [statusMenu, setStatusMenu] = useState(false);
  const [payMenu, setPayMenu] = useState(false);
  const [snack, setSnack] = useState(false);

  const carLabel = useMemo(() => {
    const c = mockCars.find((x) => x.id === carId);
    return c ? `${c.model} — ${c.plate} (${c.clientName})` : "Selecione um carro";
  }, [carId]);

  const submit = () => {
    // TODO: API
    setSnack(true);
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
              {mockCars.map((c) => (
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
                <Button mode="outlined" textColor={theme.colors.error} icon="delete" onPress={() => setSnack(true)}>
                  Excluir
                </Button>
              ) : null}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={2000}>
        {editing ? "Serviço atualizado (mock)." : "Serviço cadastrado (mock)."}
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
