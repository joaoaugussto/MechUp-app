import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
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
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const handleDelete = async () => {
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
                placeholder="(17) 99999-9999"
                value={phone}
                onChangeText={(text) => {
                  // Remove tudo que não é número
                  const cleaned = text.replace(/\D/g, "");
                  // Limita a 11 dígitos (DDD + 9 números)
                  const limited = cleaned.slice(0, 11);
                  // Aplica a máscara
                  let masked = limited;
                  if (limited.length <= 2) masked = limited;
                  else if (limited.length <= 7) masked = `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
                  else masked = `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
                  setPhone(masked);
                }}
                keyboardType="phone-pad"
                maxLength={15}
                left={<TextInput.Icon icon="phone" />}
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
                    onPress={() => setConfirmDelete(true)}
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
      {confirmDelete && (
        <View style={styles.overlay}>
          <Card style={styles.confirmCard}>
            <Card.Content style={{ gap: 12 }}>
              <Text variant="titleMedium">Excluir cliente?</Text>
              <Text variant="bodyMedium" style={{ color: "#888" }}>
                Essa ação não pode ser desfeita.
              </Text>
              <Button
                mode="contained"
                buttonColor={theme.colors.error}
                textColor="#fff"
                icon="delete"
                onPress={() => {
                  setConfirmDelete(false);
                  void handleDelete();
                }}
              >
                Sim, excluir
              </Button>
              <Button mode="outlined" onPress={() => setConfirmDelete(false)}>
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
    gap: 12,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
  actions: {
    gap: 8,
    marginTop: 8,
  },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 99,
  },
  confirmCard: {
    borderRadius: 16,
  },
});
