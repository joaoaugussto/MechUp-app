import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, List, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/AuthProvider";

export default function MorePage() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout, user, shop } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      >
        <Card mode="outlined" style={[styles.profileCard, { borderColor: theme.colors.outlineVariant }]}>
          <Card.Content style={styles.profileContent}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
              <MaterialCommunityIcons name="store" size={28} color={theme.colors.onPrimaryContainer} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="titleMedium">{shop?.name ?? "Oficina"}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {user?.name ?? "Usuário"}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {user?.email ?? ""}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
          <Card.Content style={{ padding: 0 }}>
            <List.Item
              title="Financeiro"
              description="Resumo e lista de pagamentos"
              left={(p) => <List.Icon {...p} icon="bank" />}
              right={() => <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />}
              onPress={() => router.push("/financeiro")}
            />
            <Divider />
            <List.Item
              title="Configurações"
              description="Perfil e preferências"
              left={(p) => <List.Icon {...p} icon="cog" />}
              right={() => <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />}
              onPress={() => router.push("/configuracoes")}
            />
            <Divider />
            <List.Item
              title="Sair"
              description="Encerrar sessão desta oficina"
              titleStyle={{ color: theme.colors.error }}
              left={(p) => <List.Icon {...p} icon="logout" color={theme.colors.error} />}
              right={() => <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.error} />}
              onPress={() => setConfirmLogout(true)}
            />
          </Card.Content>
        </Card>
      </ScrollView>

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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  profileCard: {
    borderRadius: 16,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
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