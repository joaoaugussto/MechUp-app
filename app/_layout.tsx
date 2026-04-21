import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const navigationTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  const paperTheme = useMemo(() => {
    const base = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        tertiary: colorScheme === "dark" ? "#81C784" : "#2E7D32",
      },
    };
  }, [colorScheme]);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navigationTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="financeiro" options={{ title: "Financeiro" }} />
            <Stack.Screen name="configuracoes" options={{ title: "Configurações" }} />
            <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
            <Stack.Screen name="cliente/novo" options={{ title: "Novo cliente" }} />
            <Stack.Screen name="cliente/[id]" options={{ title: "Editar cliente" }} />
            <Stack.Screen name="carro/novo" options={{ title: "Novo carro" }} />
            <Stack.Screen name="carro/[id]" options={{ title: "Editar carro" }} />
            <Stack.Screen name="servico/novo" options={{ title: "Nova OS" }} />
            <Stack.Screen name="servico/[id]" options={{ title: "Editar OS" }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
