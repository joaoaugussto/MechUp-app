import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/AuthProvider";

const MASTER_SECRET = process.env.EXPO_PUBLIC_MASTER_SECRET ?? "dev-master";

export default function LoginPage() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState("");

  // Modal master
  const [masterVisible, setMasterVisible] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [masterError, setMasterError] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await login({ email, password });
      router.replace("/");
    } catch {
      setSnack("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  const onMasterSubmit = () => {
    if (masterPassword === MASTER_SECRET) {
      setMasterVisible(false);
      setMasterPassword("");
      setMasterError(false);
      router.push("/admin");
    } else {
      setMasterError(true);
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
      >
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

            {/* Botão discreto — acesso restrito */}
            <Button
              mode="text"
              textColor={theme.colors.surfaceVariant}
              onPress={() => setMasterVisible(true)}
            >
              •••
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal senha master */}
      <Modal visible={masterVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <Card style={styles.modalCard}>
            <Card.Content style={styles.form}>
              <Text variant="titleMedium">Acesso restrito</Text>
              <TextInput
                mode="outlined"
                label="Senha master"
                value={masterPassword}
                onChangeText={(v) => { setMasterPassword(v); setMasterError(false); }}
                secureTextEntry
                error={masterError}
              />
              {masterError && (
                <Text style={{ color: theme.colors.error }}>Senha incorreta.</Text>
              )}
              <Button mode="contained" onPress={onMasterSubmit}>
                Entrar
              </Button>
              <Button mode="text" onPress={() => { setMasterVisible(false); setMasterPassword(""); setMasterError(false); }}>
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