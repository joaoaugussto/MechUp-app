import { useLocalSearchParams } from "expo-router";

import CarFormPage from "@/src/pages/CarFormPage";

export default function EditarCarroScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const carId = Array.isArray(id) ? id[0] : id;
  return <CarFormPage carId={carId} />;
}
