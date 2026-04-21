import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

export default function ModalScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineSmall">Modal de exemplo</Text>
      <Text variant="bodyMedium" style={[styles.sub, { color: theme.colors.onSurfaceVariant }]}>
        Use para confirmações, formulários rápidos ou detalhes sem sair do fluxo principal.
      </Text>
      <Button mode="contained-tonal" onPress={() => router.dismissTo("/")}>
        Ir para início
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 16,
  },
  sub: {
    marginBottom: 8,
  },
});
