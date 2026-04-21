import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/lib/api";

export default function OnboardingPage() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [setupSecret, setSetupSecret] = useState("dev-setup");
  const [shopName, setShopName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [createdApiKey, setCreatedApiKey] = useState("");
  const [createdShopName, setCreatedShopName] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState("");

  const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());

  const validate = () => {
    if (!setupSecret.trim()) return "Setup Secret é obrigatório.";
    if (!shopName.trim()) return "Nome da oficina é obrigatório.";
    if (!adminName.trim()) return "Nome do admin é obrigatório.";
    if (!isEmail(adminEmail)) return "Informe um e-mail válido.";
    if (adminPassword.length < 6) return "Senha deve ter no mínimo 6 caracteres.";
    return "";
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setSnack(validationError);
      return;
    }

    setLoading(true);
    try {
      const shop = await api.createShop({ name: shopName, setupSecret });
      await api.authRegister({
        setupSecret,
        shopApiKey: shop.apiKey,
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      });
      setCreatedApiKey(shop.apiKey);
      setCreatedShopName(shop.name);
      setSnack("Oficina criada com sucesso. Guarde a Shop API Key.");
    } catch {
      setSnack("Falha ao criar oficina. Verifique o setup secret e os dados.");
    } finally {
      setLoading(false);
    }
  };

  const message = `Acesso da oficina\n\nOficina: ${createdShopName || shopName}\nShop API Key: ${createdApiKey}\nE-mail: ${adminEmail}\n\nUse esses dados para login no app.`;

  const shareWhatsApp = async () => {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    await Linking.openURL(url);
  };

  const shareEmail = async () => {
    const subject = encodeURIComponent("Acesso da oficina");
    const body = encodeURIComponent(message);
    await Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.header}>
          <Text variant="headlineSmall">Criar oficina (admin)</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Fluxo para seu sócio criar uma nova oficina e o primeiro usuário.
          </Text>
        </View>

        <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
          <Card.Content style={styles.form}>
            <TextInput mode="outlined" label="Setup Secret" value={setupSecret} onChangeText={setSetupSecret} autoCapitalize="none" />
            <TextInput mode="outlined" label="Nome da oficina" value={shopName} onChangeText={setShopName} />
            <TextInput mode="outlined" label="Nome do admin" value={adminName} onChangeText={setAdminName} />
            <TextInput mode="outlined" label="E-mail do admin" value={adminEmail} onChangeText={setAdminEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextInput mode="outlined" label="Senha do admin" value={adminPassword} onChangeText={setAdminPassword} secureTextEntry />
            <Button mode="contained" loading={loading} disabled={loading} onPress={submit}>
              Criar oficina e usuário
            </Button>
          </Card.Content>
        </Card>

        {createdApiKey ? (
          <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
            <Card.Content style={styles.form}>
              <Text variant="titleSmall">Shop API Key gerada</Text>
              <TextInput mode="outlined" value={createdApiKey} editable={false} multiline />
            <Button
              mode="contained-tonal"
              onPress={async () => {
                await Clipboard.setStringAsync(createdApiKey);
                setSnack("Shop API Key copiada.");
              }}
            >
              Copiar Shop API Key
            </Button>
            <Button mode="outlined" onPress={shareWhatsApp}>
              Compartilhar no WhatsApp
            </Button>
            <Button mode="outlined" onPress={shareEmail}>
              Compartilhar por e-mail
            </Button>
              <Button mode="outlined" onPress={() => router.replace("/login")}>
                Ir para login
              </Button>
            </Card.Content>
          </Card>
        ) : null}
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
    gap: 16,
    maxWidth: 560,
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
});

