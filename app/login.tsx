import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, IconButton, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/AuthProvider";

const ADMIN_ACCESS_SECRET = process.env.EXPO_PUBLIC_MASTER_SECRET ?? "dev-master";

export default function LoginPage() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState("");

  const [adminAccessVisible, setAdminAccessVisible] = useState(false);
  const [adminAccessPassword, setAdminAccessPassword] = useState("");
  const [adminAccessError, setAdminAccessError] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.replace("/");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/Network request failed|Failed to fetch|NetworkError/i.test(msg)) {
        setSnack("Sem conexão com a API. Suba o servidor (npm run server) e defina EXPO_PUBLIC_API_URL se estiver no celular.");
      } else if (/\[invalid_credentials\]/.test(msg) || /Falha na API \(401\)/.test(msg)) {
        setSnack("E-mail ou senha incorretos.");
      } else if (/\[shop_inactive\]/.test(msg) || /Falha na API \(403\)/.test(msg)) {
        setSnack("Oficina inativa. Peça para reativar no painel administrativo.");
      } else if (/Falha na API \((4|5)\d{2}\)/.test(msg)) {
        setSnack("Erro da API no login. Verifique se o servidor está atualizado e rodando.");
      } else {
        setSnack("Falha inesperada ao entrar.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onMasterSubmit = () => {
    const secret = adminAccessPassword.trim();
    if (!secret) {
      setAdminAccessError(true);
      return;
    }
    if (secret === ADMIN_ACCESS_SECRET) {
      setAdminAccessVisible(false);
      setAdminAccessPassword("");
      router.push("/admin");
    } else {
      setAdminAccessError(true);
    }
  };

  return (
    <>
      <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <IconButton
          icon="dots-horizontal"
          size={22}
          style={[styles.adminDots, { top: insets.top + 8 }]}
          iconColor={theme.colors.onSurfaceVariant}
          onPress={() => setAdminAccessVisible(true)}
        />
        <View style={styles.header}>
          <Text variant="headlineMedium">Entrar</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Faça login para acessar o app.
          </Text>
        </View>

        <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
          <Card.Content style={styles.form}>
            <TextInput
              mode="outlined"
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              mode="outlined"
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Button mode="contained" loading={loading} disabled={loading} onPress={onSubmit}>
              Entrar
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
      </View>

      <Modal visible={adminAccessVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <Card style={styles.modalCard}>
            <Card.Content style={styles.form}>
              <Text variant="titleMedium">Painel administrativo</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Use a senha configurada em EXPO_PUBLIC_MASTER_SECRET.
              </Text>
              <TextInput
                mode="outlined"
                label="Senha de acesso"
                value={adminAccessPassword}
                onChangeText={(v) => {
                  setAdminAccessPassword(v);
                  setAdminAccessError(false);
                }}
                secureTextEntry
                error={adminAccessError}
              />
              {adminAccessError && <Text style={{ color: theme.colors.error }}>Senha incorreta.</Text>}
              <Button mode="contained" onPress={onMasterSubmit}>
                Entrar
              </Button>
              <Button
                mode="text"
                onPress={() => {
                  setAdminAccessVisible(false);
                  setAdminAccessPassword("");
                  setAdminAccessError(false);
                }}
              >
                Cancelar
              </Button>
            </Card.Content>
          </Card>
        </View>
      </Modal>

      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack("")} duration={3000}>
        {snack}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },
  adminDots: {
    position: "absolute",
    right: 4,
    zIndex: 10,
  },
  header: {
    gap: 8,
  },
  form: {
    gap: 12,
    paddingTop: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    borderRadius: 16,
  },
});
