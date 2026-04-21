import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Menu, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, type Car, type Client } from "@/lib/api";
import { PageHeader } from "@/src/components/shared/PageHeader";

export interface CarFormPageProps {
  carId?: string;
}

export default function CarFormPage({ carId }: CarFormPageProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const editing = Boolean(carId);
  const [cars, setCars] = useState<Car[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [year, setYear] = useState("");
  const [clientId, setClientId] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [snack, setSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  useEffect(() => {
    api.getClients().then((data) => {
      setClients(data);
      if (!clientId && data[0]) setClientId(data[0].id);
    });
    api.getCars().then(setCars);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!carId || cars.length === 0) return;
    const existing = cars.find((c) => c.id === carId);
    if (!existing) return;
    setName(existing.name);
    setModel(existing.model);
    setPlate(existing.plate);
    setYear(String(existing.year));
    setClientId(existing.clientId);
  }, [carId, cars]);

  const clientLabel = useMemo(() => clients.find((c) => c.id === clientId)?.name ?? "Selecione um cliente", [clientId, clients]);

  const submit = async () => {
    try {
      const payload = { name, model, plate, year: Number(year), clientId };
      if (editing && carId) {
        await api.updateCar(carId, payload);
        setSnackMsg("Carro atualizado com sucesso.");
      } else {
        await api.createCar(payload);
        setSnackMsg("Carro cadastrado com sucesso.");
      }
    } catch {
      setSnackMsg("Erro ao salvar carro. Verifique a API e tente novamente.");
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

        <PageHeader title={editing ? "Editar carro" : "Novo carro"} description="Vincule um veículo a um cliente existente." />

        <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
          <Card.Content style={{ gap: 16, paddingTop: 16 }}>
            <TextInput mode="outlined" label="Apelido / nome" placeholder="Ex: Civic do João" value={name} onChangeText={setName} />
            <TextInput mode="outlined" label="Modelo" placeholder="Honda Civic" value={model} onChangeText={setModel} />
            <TextInput mode="outlined" label="Placa" placeholder="ABC-1D23" value={plate} onChangeText={setPlate} autoCapitalize="characters" />
            <TextInput mode="outlined" label="Ano" placeholder="2020" value={year} onChangeText={setYear} keyboardType="number-pad" />

            <Text variant="labelLarge">Cliente</Text>
            <Menu visible={menuOpen} onDismiss={() => setMenuOpen(false)} anchor={<Button mode="outlined" onPress={() => setMenuOpen(true)}>{clientLabel}</Button>}>
              {clients.map((c) => (
                <Menu.Item key={c.id} onPress={() => { setClientId(c.id); setMenuOpen(false); }} title={c.name} />
              ))}
            </Menu>

            <View style={styles.actions}>
              <Button mode="contained" icon="content-save" onPress={submit}>
                {editing ? "Salvar alterações" : "Cadastrar carro"}
              </Button>
              {editing ? (
                <Button
                  mode="outlined"
                  textColor={theme.colors.error}
                  icon="delete"
                  onPress={async () => {
                    try {
                      if (!carId) return;
                      await api.deleteCar(carId);
                      setSnackMsg("Carro excluído com sucesso.");
                      setSnack(true);
                      router.back();
                    } catch {
                      setSnackMsg("Erro ao excluir carro.");
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
