import { useLocalSearchParams } from "expo-router";

import ClientFormPage from "@/src/pages/ClientFormPage";

export default function EditarClienteScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const clientId = Array.isArray(id) ? id[0] : id;
  return <ClientFormPage clientId={clientId} />;
}
