import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Snackbar, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/lib/api";
import { PageHeader } from "@/src/components/shared/PageHeader";

export interface ClientFormPageProps {
  /** Quando definido, formulário de edição (mock). */
  clientId?: string;
}

export default function ClientFormPage({ clientId }: ClientFormPageProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const editing = Boolean(clientId);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [snack, setSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  useEffect(() => {
    if (!clientId) return;
    api.getClient(clientId).then((client) => {
      setName(client.name);
      setPhone(client.phone);
    });
  }, [clientId]);

  const submit = async () => {
    try {
      if (editing && clientId) {
        await api.updateClient(clientId, { name, phone });
        setSnackMsg("Cliente atualizado com sucesso.");
      } else {
        await api.createClient({ name, phone });
        setSnackMsg("Cliente cadastrado com sucesso.");
      }
    } catch {
      setSnackMsg(`Erro ao salvar cliente. Verifique a API e tente novamente.`);
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
                <Button
                  mode="outlined"
                  textColor={theme.colors.error}
                  icon="delete"
                  onPress={async () => {
                    try {
                      if (!clientId) return;
                      await api.deleteClient(clientId);
                      setSnackMsg("Cliente excluído com sucesso.");
                      setSnack(true);
                      router.back();
                    } catch {
                      setSnackMsg("Erro ao excluir cliente.");
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
