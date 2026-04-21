import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Menu, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PageHeader } from "@/src/components/shared/PageHeader";
import { mockCars, mockClients } from "@/lib/mock-data";

export interface CarFormPageProps {
  carId?: string;
}

export default function CarFormPage({ carId }: CarFormPageProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const editing = Boolean(carId);
  const existing = editing ? mockCars.find((c) => c.id === carId) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [model, setModel] = useState(existing?.model ?? "");
  const [plate, setPlate] = useState(existing?.plate ?? "");
  const [year, setYear] = useState(existing ? String(existing.year) : "");
  const [clientId, setClientId] = useState(existing?.clientId ?? mockClients[0]?.id ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [snack, setSnack] = useState(false);

  const clientLabel = useMemo(() => mockClients.find((c) => c.id === clientId)?.name ?? "Selecione um cliente", [clientId]);

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

        <PageHeader title={editing ? "Editar carro" : "Novo carro"} description="Vincule um veículo a um cliente existente." />

        <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
          <Card.Content style={{ gap: 16, paddingTop: 16 }}>
            <TextInput mode="outlined" label="Apelido / nome" placeholder="Ex: Civic do João" value={name} onChangeText={setName} />
            <TextInput mode="outlined" label="Modelo" placeholder="Honda Civic" value={model} onChangeText={setModel} />
            <TextInput mode="outlined" label="Placa" placeholder="ABC-1D23" value={plate} onChangeText={setPlate} autoCapitalize="characters" />
            <TextInput mode="outlined" label="Ano" placeholder="2020" value={year} onChangeText={setYear} keyboardType="number-pad" />

            <Text variant="labelLarge">Cliente</Text>
            <Menu visible={menuOpen} onDismiss={() => setMenuOpen(false)} anchor={<Button mode="outlined" onPress={() => setMenuOpen(true)}>{clientLabel}</Button>}>
              {mockClients.map((c) => (
                <Menu.Item key={c.id} onPress={() => { setClientId(c.id); setMenuOpen(false); }} title={c.name} />
              ))}
            </Menu>

            <View style={styles.actions}>
              <Button mode="contained" icon="content-save" onPress={submit}>
                {editing ? "Salvar alterações" : "Cadastrar carro"}
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
        {editing ? "Carro atualizado (mock)." : "Carro cadastrado (mock)."}
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
