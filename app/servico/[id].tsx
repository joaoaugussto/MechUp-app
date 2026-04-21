import { useLocalSearchParams } from "expo-router";

import ServiceFormPage from "@/src/pages/ServiceFormPage";

export default function EditarOsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const serviceId = Array.isArray(id) ? id[0] : id;
  return <ServiceFormPage serviceId={serviceId} />;
}
