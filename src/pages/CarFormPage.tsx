import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getClients().then(setClients).catch(() => setClients([]));
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

  const clientLabel = useMemo(() => clients.find((c) => c.id === clientId)?.name ?? "Selecionar Cliente", [clientId, clients]);

  const submit = async () => {
    if (saving) return;
    if (!name.trim() || !model.trim() || !plate.trim() || !year.trim() || !clientId) {
      setSnackMsg("Preencha todos os campos obrigatórios.");
      setSnack(true);
      return;
    }
    const parsedYear = Number(year);
    if (!Number.isFinite(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      setSnackMsg("Informe um ano válido.");
      setSnack(true);
      return;
    }
    setSaving(true);
    try {
      const payload = { name: name.trim(), model: model.trim(), plate: plate.trim().toUpperCase(), year: parsedYear, clientId };
      if (editing && carId) {
        await api.updateCar(carId, payload);
        setSnackMsg("Carro atualizado com sucesso.");
      } else {
        await api.createCar(payload);
        setSnackMsg("Carro cadastrado com sucesso.");
        router.replace("/cars");
        return;
      }
    } catch {
      setSnackMsg("Erro ao salvar carro. Verifique a API e tente novamente.");
    } finally {
      setSaving(false);
      setSnack(true);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
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
              <Button mode="contained" icon="content-save" onPress={submit} loading={saving} disabled={saving}>
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
});
