import { loadNotifPreference, saveNotifPreference } from '@/services/notificationService';
import { PageHeader } from "@/src/components/shared/PageHeader";
import { useThemeMode } from "@/src/contexts/ThemeContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, Snackbar, Switch, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthProvider";

export default function SettingsPage() {
  const theme = useTheme();
  const { isDark, toggleTheme } = useThemeMode();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [shop, setShop] = useState("");
  const [email, setEmail] = useState("");
  const [snack, setSnack] = useState(false);
  const [osNotif, setOsNotif] = useState(true);
  const [payNotif, setPayNotif] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  function handleOsNotif(v: boolean) {
    setOsNotif(v);
    saveNotifPreference('osNotif', v);
  }
  function handlePayNotif(v: boolean) {
    setPayNotif(v);
    saveNotifPreference('payNotif', v);
  }
  useEffect(() => {
    loadNotifPreference('osNotif').then(setOsNotif);
    loadNotifPreference('payNotif').then(setPayNotif);
  }, []);

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader title="Configurações" description="Preferências da oficina e do seu perfil." />

        <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
          <Card.Title title="Perfil" />
          <Card.Content style={{ gap: 12 }}>
            <TextInput mode="outlined" label="Nome" value={name} onChangeText={setName} />
            <TextInput mode="outlined" label="Nome da oficina" value={shop} onChangeText={setShop} />
            <TextInput mode="outlined" label="E-mail" value={email} onChangeText={setEmail} placeholder="voce@oficina.com" keyboardType="email-address" autoCapitalize="none" />
            <Button mode="contained" icon="content-save" onPress={() => setSnack(true)}>
              Salvar perfil
            </Button>
          </Card.Content>
        </Card>

        <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
          <Card.Title title="Preferências" />
          <Card.Content style={{ gap: 4 }}>
            <SettingRow
              label="Notificações de OS"
              description="Alertas quando um serviço estiver próximo do prazo."
              value={osNotif}
              onValueChange={handleOsNotif}
            />
            <Divider />
            <SettingRow
              label="Pagamentos pendentes"
              description="Lembretes de cobranças em aberto."
              value={payNotif}
              onValueChange={handlePayNotif}
            />
            <Divider />
            <SettingRow
              label="Modo escuro"
              description="Alterna entre tema claro e escuro."
              value={isDark}
              onValueChange={toggleTheme}
            />
          </Card.Content>
        </Card>

        <Card mode="outlined" style={[styles.dangerCard, { borderColor: theme.colors.error }]}>
          <Card.Title title="Conta" titleStyle={{ color: theme.colors.error }} />
          <Card.Content>
            <Button
              mode="outlined"
              textColor={theme.colors.error}
              icon="logout"
              onPress={() => setConfirmLogout(true)}
            >
              Sair da conta
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={2500} style={{ marginBottom: insets.bottom }}>
        Ação registrada.
      </Snackbar>

      {confirmLogout && (
        <View style={styles.overlay}>
          <Card style={styles.confirmCard}>
            <Card.Content style={{ gap: 12 }}>
              <Text variant="titleMedium">Sair da conta?</Text>
              <Text variant="bodyMedium" style={{ color: "#888" }}>
                Você precisará fazer login novamente.
              </Text>
              <Button
                mode="contained"
                buttonColor={theme.colors.error}
                textColor="#fff"
                icon="logout"
                onPress={async () => {
                  setConfirmLogout(false);
                  await logout();
                  router.replace("/login");
                }}
              >
                Sim, sair
              </Button>
              <Button mode="outlined" onPress={() => setConfirmLogout(false)}>
                Cancelar
              </Button>
            </Card.Content>
          </Card>
        </View>
      )}
    </>
  );
}

function SettingRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
        <Text variant="titleSmall">{label}</Text>
        <Text variant="bodySmall" style={{ opacity: 0.75 }}>
          {description}
        </Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    gap: 8,
  },
  dangerCard: {
    marginBottom: 8,
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
