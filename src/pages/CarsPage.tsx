import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Chip, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, type Car } from "@/lib/api";
import { PageHeader } from "@/src/components/shared/PageHeader";

export default function CarsPage() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    api.getCars().then(setCars).catch(() => setCars([]));
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
    >
      <PageHeader
        title="Carros"
        description="Veículos cadastrados na oficina."
        action={
          <Button mode="contained" icon="car-outline" onPress={() => router.push("/carro/novo")}>
            Novo carro
          </Button>
        }
      />

      <View style={styles.grid}>
        {cars.map((car) => (
          <Card key={car.id} mode="outlined" style={[styles.card, { borderColor: theme.colors.outlineVariant }]}>
            <Card.Content style={{ gap: 10 }}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="titleMedium" numberOfLines={1}>
                    {car.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                    {car.model}
                  </Text>
                </View>
                <Chip mode="outlined" style={{ borderColor: "#D4AF37" }} textStyle={{ fontFamily: "monospace", color: "#B8860B" }}>
                  {car.plate}
                </Chip>
              </View>
              <View style={styles.meta}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {car.year}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="account" size={14} color="#B8860B" />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                    {car.client?.name ?? "-"}
                  </Text>
                </View>
              </View>
              <Button mode="text" icon="pencil" onPress={() => router.push(`/carro/${car.id}`)}>
                Editar
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  grid: {
    gap: 12,
  },
  card: {},
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
});
