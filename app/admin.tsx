import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
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
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingShop, setCreatingShop] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [deletingShopId, setDeletingShopId] = useState<string | null>(null);
  const [createUserName, setCreateUserName] = useState("");
  const [createUserEmail, setCreateUserEmail] = useState("");
  const [createUserPassword, setCreateUserPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [snack, setSnack] = useState("");

  const loadShops = async () => {
    setLoading(true);
    try {
      const data = await api.adminListShops();
      setShops(data);
    } catch {
      setSnack("Falha ao carregar oficinas.");
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadShops();
  }, []);

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      >
        <Text variant="headlineSmall">Painel administrativo</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Gerencie oficinas e usuários.
        </Text>
        <>
          <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
            <Card.Content style={styles.block}>
              <Text variant="titleSmall">Criar nova oficina</Text>
              <TextInput
                mode="outlined"
                label="Nome da oficina"
                placeholder="Ex: Shop B Teste"
                value={newShopName}
                onChangeText={setNewShopName}
              />
              <Button
                mode="contained"
                onPress={async () => {
                  const name = newShopName.trim();
                  if (!name) {
                    setSnack("Informe o nome da oficina.");
                    return;
                  }
                  setCreatingShop(true);
                  try {
                    const created = await api.adminCreateShop(name);
                    setSnack(`Oficina ${created.name} criada com sucesso.`);
                    setNewShopName("");
                    await loadShops();
                  } catch {
                    setSnack("Falha ao criar oficina.");
                  } finally {
                    setCreatingShop(false);
                  }
                }}
                loading={creatingShop}
                disabled={creatingShop}
              >
                Criar oficina
              </Button>
            </Card.Content>
          </Card>

          <Button mode="outlined" onPress={() => void loadShops()} loading={loading} disabled={loading}>
            Atualizar lista
          </Button>

          {shops.map((shop) => (
            <Card key={shop.id} mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
              <Card.Content style={styles.block}>
                <Text variant="titleMedium">{shop.name}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Status: {shop.isActive ? "Ativa" : "Inativa"} · Usuários: {shop._count.users} · Clientes:{" "}
                  {shop._count.clients}
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
                      await api.adminSetShopActive(shop.id, !shop.isActive);
                      setSnack(`Oficina ${!shop.isActive ? "ativada" : "inativada"} com sucesso.`);
                      await loadShops();
                    } catch {
                      setSnack("Falha ao alterar status da oficina.");
                    }
                  }}
                >
                  {shop.isActive ? "Inativar oficina" : "Ativar oficina"}
                </Button>
                <Button
                  mode="outlined"
                  textColor={theme.colors.error}
                  loading={deletingShopId === shop.id}
                  disabled={deletingShopId === shop.id}
                  onPress={async () => {
                    setDeletingShopId(shop.id);
                    try {
                      await api.adminDeleteShop(shop.id);
                      setSnack(`Oficina ${shop.name} removida com sucesso.`);
                      await loadShops();
                    } catch {
                      setSnack("Falha ao remover oficina.");
                    } finally {
                      setDeletingShopId(null);
                    }
                  }}
                >
                  Excluir oficina
                </Button>

                  <View style={styles.divider} />
                  <Text variant="titleSmall">Criar usuário da oficina</Text>
                  <TextInput mode="outlined" label="Nome do usuário" value={createUserName} onChangeText={setCreateUserName} />
                  <TextInput
                    mode="outlined"
                    label="E-mail do usuário"
                    value={createUserEmail}
                    onChangeText={setCreateUserEmail}
                    autoCapitalize="none"
                  />
                  <TextInput
                    mode="outlined"
                    label="Senha inicial"
                    value={createUserPassword}
                    onChangeText={setCreateUserPassword}
                    secureTextEntry
                  />
                <Button
                  mode="outlined"
                  onPress={async () => {
                    if (!createUserName || !createUserEmail || createUserPassword.length < 6) {
                      setSnack("Informe nome, e-mail e senha (mín. 6).");
                      return;
                    }
                    try {
                      await api.adminCreateUser(shop.id, {
                        name: createUserName,
                        email: createUserEmail,
                        password: createUserPassword,
                      });
                      setSnack("Usuário criado com sucesso.");
                      setCreateUserName("");
                      setCreateUserEmail("");
                      setCreateUserPassword("");
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
                  <TextInput
                    mode="outlined"
                    label="E-mail do usuário"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    autoCapitalize="none"
                  />
                  <TextInput
                    mode="outlined"
                    label="Nova senha"
                    value={resetPassword}
                    onChangeText={setResetPassword}
                    secureTextEntry
                  />
                <Button
                  mode="outlined"
                  onPress={async () => {
                    if (!resetEmail || resetPassword.length < 6) {
                      setSnack("Informe e-mail e senha (mín. 6).");
                      return;
                    }
                    try {
                      await api.adminResetPassword(shop.id, resetEmail, resetPassword);
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
        </>
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
