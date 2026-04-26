import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
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
  const [phone, setPhone] = useState("(17)");
  const [snack, setSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    api.getClient(clientId).then((client) => {
      setName(client.name);
      setPhone(client.phone);
    });
  }, [clientId]);

  const submit = async () => {
    if (saving) return;
    if (!name.trim() || !phone.trim()) {
      setSnackMsg("Preencha nome e telefone.");
      setSnack(true);
      return;
    }
    setSaving(true);
    try {
      if (editing && clientId) {
        await api.updateClient(clientId, { name: name.trim(), phone: phone.trim() });
        setSnackMsg("Cliente atualizado com sucesso.");
      } else {
        await api.createClient({ name: name.trim(), phone: phone.trim() });
        setSnackMsg("Cliente cadastrado com sucesso.");
        router.replace("/clients");
        return;
      }
    } catch {
      setSnackMsg(`Erro ao salvar cliente. Verifique a API e tente novamente.`);
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

          <PageHeader
            title={editing ? "Editar cliente" : "Novo cliente"}
            description="Informe os dados de contato do cliente."
          />

          <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
            <Card.Content style={{ gap: 16, paddingTop: 16 }}>
              <TextInput mode="outlined" 
              label="Nome completo" 
              placeholder="Ex: João Pereira"
               value={name} onChangeText={setName} 
               />
              <TextInput
                mode="outlined"
                label="Telefone"
                value={phone}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "");
                  let masked = cleaned;
                  if (cleaned.length <= 2) masked = cleaned;
                  else if (cleaned.length <= 7) masked = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
                  else masked = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
                  setPhone(masked);
                }}
                keyboardType="phone-pad"
                maxLength={15}
              />
              <View style={styles.actions}>
                <Button mode="contained" icon="content-save" onPress={submit} loading={saving} disabled={saving}>
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
