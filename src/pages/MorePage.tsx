import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { Card, List, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MorePage() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
    >
      <Text variant="headlineMedium" style={{ marginBottom: 8 }}>
        Mais
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
        Atalhos para telas que não estão nas abas inferiores e testes do app.
      </Text>

      <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
        <Card.Content style={{ padding: 0 }}>
          <List.Item
            title="Financeiro"
            description="Resumo e lista de pagamentos"
            left={(p) => <List.Icon {...p} icon="bank" />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />}
            onPress={() => router.push("/financeiro")}
          />
          <List.Item
            title="Configurações"
            description="Perfil e preferências"
            left={(p) => <List.Icon {...p} icon="cog" />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />}
            onPress={() => router.push("/configuracoes")}
          />
          <List.Item
            title="Modal de exemplo"
            description="Teste de apresentação modal (Expo Router)"
            left={(p) => <List.Icon {...p} icon="layers" />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />}
            onPress={() => router.push("/modal")}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
});
