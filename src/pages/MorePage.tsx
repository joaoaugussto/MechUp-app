import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Divider, List, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/AuthProvider";

export default function MorePage() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout, user, shop } = useAuth();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
    >
      {/* Header com info da oficina */}
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

      {/* Menu de opções */}
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
            onPress={async () => {
              await logout();
              router.replace("/login");
            }}
          />
        </Card.Content>
      </Card>
    </ScrollView>
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
});