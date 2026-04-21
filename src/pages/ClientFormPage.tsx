import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Snackbar, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PageHeader } from "@/src/components/shared/PageHeader";
import { mockClients } from "@/lib/mock-data";

export interface ClientFormPageProps {
  /** Quando definido, formulário de edição (mock). */
  clientId?: string;
}

export default function ClientFormPage({ clientId }: ClientFormPageProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const editing = Boolean(clientId);
  const existing = editing ? mockClients.find((c) => c.id === clientId) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [snack, setSnack] = useState(false);

  const submit = () => {
    // TODO: API POST/PUT
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
          title={editing ? "Editar cliente" : "Novo cliente"}
          description="Informe os dados de contato do cliente."
        />

        <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
          <Card.Content style={{ gap: 16, paddingTop: 16 }}>
            <TextInput mode="outlined" label="Nome completo" placeholder="Ex: João Pereira" value={name} onChangeText={setName} />
            <TextInput mode="outlined" label="Telefone" placeholder="(11) 99999-9999" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <View style={styles.actions}>
              <Button mode="contained" icon="content-save" onPress={submit}>
                {editing ? "Salvar alterações" : "Cadastrar cliente"}
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
        {editing ? "Cliente atualizado (mock)." : "Cliente cadastrado (mock)."}
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
