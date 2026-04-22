import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/lib/api";
import {
  clearMasterAdminSecretHandoff,
  peekMasterAdminSecretHandoff,
} from "@/src/admin/masterAdminHandoff";

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
  const [sessionSecret, setSessionSecret] = useState<string | null>(null);
  const [unlockInput, setUnlockInput] = useState("");
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [snack, setSnack] = useState("");
  const [unlockError, setUnlockError] = useState(false);
  const [handoffChecked, setHandoffChecked] = useState(false);

  const loadShops = useCallback(async (secret: string, opts?: { handoffAttempt?: boolean }) => {
    setLoading(true);
    try {
      const data = await api.adminListShops(secret);
      setShops(data);
      setSessionSecret(secret);
      setUnlockError(false);
    } catch {
      setSnack("Falha ao carregar oficinas. Verifique a senha master.");
      setUnlockError(true);
      setSessionSecret(null);
      setShops([]);
    } finally {
      if (opts?.handoffAttempt) clearMasterAdminSecretHandoff();
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handed = peekMasterAdminSecretHandoff();
    if (handed) {
      void loadShops(handed, { handoffAttempt: true }).finally(() => setHandoffChecked(true));
    } else {
      setHandoffChecked(true);
    }
  }, [loadShops]);

  const onUnlock = () => {
    const s = unlockInput.trim();
    if (!s) {
      setUnlockError(true);
      return;
    }
    void loadShops(s);
  };

  const secret = sessionSecret;

  if (!handoffChecked) {
    return (
      <View style={[styles.boot, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Carregando painel…
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      >
        <Text variant="headlineSmall">Painel master</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Gerencie oficinas e usuários (acesso pelo login → ••• ou desbloqueie abaixo).
        </Text>

        {!secret ? (
          <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
            <Card.Content style={styles.block}>
              <Text variant="titleSmall">Senha master</Text>
              <TextInput
                mode="outlined"
                label="Senha master"
                value={unlockInput}
                onChangeText={(v) => {
                  setUnlockInput(v);
                  setUnlockError(false);
                }}
                secureTextEntry
                error={unlockError}
              />
              {unlockError ? <Text style={{ color: theme.colors.error }}>Não foi possível validar.</Text> : null}
              <Button mode="contained" onPress={onUnlock} loading={loading} disabled={loading}>
                Desbloquear painel
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Button mode="outlined" onPress={() => void loadShops(secret)} loading={loading} disabled={loading}>
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
                        await api.adminSetShopActive(secret, shop.id, !shop.isActive);
                        setSnack(`Oficina ${!shop.isActive ? "ativada" : "inativada"} com sucesso.`);
                        await loadShops(secret);
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
                  <TextInput
                    mode="outlined"
                    label="E-mail do usuário"
                    value={createEmail}
                    onChangeText={setCreateEmail}
                    autoCapitalize="none"
                  />
                  <TextInput
                    mode="outlined"
                    label="Senha inicial"
                    value={createPassword}
                    onChangeText={setCreatePassword}
                    secureTextEntry
                  />
                  <Button
                    mode="outlined"
                    onPress={async () => {
                      if (!createName || !createEmail || createPassword.length < 6) {
                        setSnack("Informe nome, e-mail e senha (mín. 6).");
                        return;
                      }
                      try {
                        await api.adminCreateUser(secret, shop.id, {
                          name: createName,
                          email: createEmail,
                          password: createPassword,
                        });
                        setSnack("Usuário criado com sucesso.");
                        setCreateName("");
                        setCreateEmail("");
                        setCreatePassword("");
                        await loadShops(secret);
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
                        await api.adminResetPassword(secret, shop.id, resetEmail, resetPassword);
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
        )}
      </ScrollView>
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack("")} duration={3000}>
        {snack}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
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
