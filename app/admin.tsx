import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/lib/api";

type ShopItem = {
  id: string;
  name: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  _count: { users: number; clients: number; cars: number; services: number };
};

export default function AdminPage() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [adminSecret, setAdminSecret] = useState("dev-master");
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [snack, setSnack] = useState("");

  const loadShops = async () => {
    setLoading(true);
    try {
      const data = await api.adminListShops(adminSecret);
      setShops(data);
    } catch {
      setSnack("Falha ao carregar oficinas. Verifique o admin secret.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      >
        <Text variant="headlineSmall">Admin master</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Gerencie oficinas: status ativo/inativo e reset de senha.
        </Text>

        <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
          <Card.Content style={styles.block}>
            <TextInput mode="outlined" label="Master Admin Secret" value={adminSecret} onChangeText={setAdminSecret} secureTextEntry />
            <Button mode="contained" onPress={loadShops} loading={loading} disabled={loading}>
              Carregar oficinas
            </Button>
          </Card.Content>
        </Card>

        {shops.map((shop) => (
          <Card key={shop.id} mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
            <Card.Content style={styles.block}>
              <Text variant="titleMedium">{shop.name}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Status: {shop.isActive ? "Ativa" : "Inativa"} · Usuários: {shop._count.users} · Clientes: {shop._count.clients}
              </Text>
              <TextInput mode="outlined" label="Shop API Key" value={shop.apiKey} editable={false} />
              <Button
                mode="contained-tonal"
                onPress={async () => {
                  await Clipboard.setStringAsync(shop.apiKey);
                  setSnack("Shop API Key copiada.");
                }}
              >
                Copiar Shop API Key
              </Button>
              <Button
                mode="outlined"
                onPress={async () => {
                  try {
                    await api.adminSetShopActive(adminSecret, shop.id, !shop.isActive);
                    setSnack(`Oficina ${!shop.isActive ? "ativada" : "inativada"} com sucesso.`);
                    await loadShops();
                  } catch {
                    setSnack("Falha ao alterar status da oficina.");
                  }
                }}
              >
                {shop.isActive ? "Inativar oficina" : "Ativar oficina"}
              </Button>

              <View style={styles.divider} />
              <Text variant="titleSmall">Criar usuário da oficina</Text>
              <TextInput mode="outlined" label="Nome do usuário" value={createName} onChangeText={setCreateName} />
              <TextInput mode="outlined" label="E-mail do usuário" value={createEmail} onChangeText={setCreateEmail} autoCapitalize="none" />
              <TextInput mode="outlined" label="Senha inicial" value={createPassword} onChangeText={setCreatePassword} secureTextEntry />
              <Button
                mode="outlined"
                onPress={async () => {
                  if (!createName || !createEmail || createPassword.length < 6) {
                    setSnack("Informe nome, e-mail e senha (mín. 6).");
                    return;
                  }
                  try {
                    await api.adminCreateUser(adminSecret, shop.id, {
                      name: createName,
                      email: createEmail,
                      password: createPassword,
                    });
                    setSnack("Usuário criado com sucesso.");
                    setCreateName("");
                    setCreateEmail("");
                    setCreatePassword("");
                    await loadShops();
                  } catch {
                    setSnack("Falha ao criar usuário (email já existe na oficina?).");
                  }
                }}
              >
                Criar usuário
              </Button>

              <View style={styles.divider} />
              <Text variant="titleSmall">Resetar senha de usuário</Text>
              <TextInput mode="outlined" label="E-mail do usuário" value={resetEmail} onChangeText={setResetEmail} autoCapitalize="none" />
              <TextInput mode="outlined" label="Nova senha" value={resetPassword} onChangeText={setResetPassword} secureTextEntry />
              <Button
                mode="outlined"
                onPress={async () => {
                  if (!resetEmail || resetPassword.length < 6) {
                    setSnack("Informe e-mail e senha (mín. 6).");
                    return;
                  }
                  try {
                    await api.adminResetPassword(adminSecret, shop.id, resetEmail, resetPassword);
                    setSnack("Senha resetada com sucesso.");
                    setResetEmail("");
                    setResetPassword("");
                  } catch {
                    setSnack("Falha ao resetar senha (usuário não encontrado?).");
                  }
                }}
              >
                Resetar senha
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack("")} duration={3000}>
        {snack}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  block: {
    gap: 10,
    paddingTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginVertical: 4,
  },
});

