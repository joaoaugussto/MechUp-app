// MechUp — dados mockados (hardcoded). 
// TODO: substituir por chamadas reais à API quando o backend estiver pronto.

export type PaymentStatus = "pago" | "pendente" | "adiantado";
export type ServiceStatus = "a_fazer" | "em_andamento" | "concluido";

export interface Client {
  id: string;
  name: string;
  phone: string;
  carsCount: number;
  createdAt: string;
}

export interface Car {
  id: string;
  name: string;
  model: string;
  plate: string;
  year: number;
  clientId: string;
  clientName: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  carId: string;
  carLabel: string;
  clientId: string;
  clientName: string;
  status: ServiceStatus;
  payment: PaymentStatus;
  price: number;
  dueDate: string;
}

export const currentUser = {
  name: "Carlos",
  shop: "MechUp Garage",
  avatar: "",
};

export const mockClients: Client[] = [
  { id: "c1", name: "João Pereira", phone: "(11) 98765-4321", carsCount: 2, createdAt: "2025-02-10" },
  { id: "c2", name: "Maria Silva", phone: "(11) 91234-5678", carsCount: 1, createdAt: "2025-03-02" },
  { id: "c3", name: "Roberto Lima", phone: "(21) 99876-1122", carsCount: 3, createdAt: "2025-01-22" },
  { id: "c4", name: "Ana Souza", phone: "(31) 98888-7777", carsCount: 1, createdAt: "2025-03-19" },
  { id: "c5", name: "Felipe Costa", phone: "(11) 97777-3322", carsCount: 1, createdAt: "2025-04-01" },
  { id: "c6", name: "Juliana Rocha", phone: "(11) 96655-4488", carsCount: 2, createdAt: "2025-04-08" },
];

export const mockCars: Car[] = [
  { id: "v1", name: "Civic do João", model: "Honda Civic", plate: "ABC-1D23", year: 2019, clientId: "c1", clientName: "João Pereira" },
  { id: "v2", name: "Hilux", model: "Toyota Hilux", plate: "BRA-2E45", year: 2021, clientId: "c1", clientName: "João Pereira" },
  { id: "v3", name: "Onix", model: "Chevrolet Onix", plate: "QWE-5R67", year: 2020, clientId: "c2", clientName: "Maria Silva" },
  { id: "v4", name: "HB20", model: "Hyundai HB20", plate: "RTY-8U90", year: 2018, clientId: "c3", clientName: "Roberto Lima" },
  { id: "v5", name: "Compass", model: "Jeep Compass", plate: "POI-9L88", year: 2022, clientId: "c3", clientName: "Roberto Lima" },
  { id: "v6", name: "Renegade", model: "Jeep Renegade", plate: "MNB-7K33", year: 2020, clientId: "c4", clientName: "Ana Souza" },
  { id: "v7", name: "Corolla", model: "Toyota Corolla", plate: "VFR-4D55", year: 2023, clientId: "c5", clientName: "Felipe Costa" },
];

export const mockServices: Service[] = [
  { id: "s1", title: "Troca de óleo + filtros", description: "Óleo sintético 5w30, filtro de óleo e ar.", carId: "v1", carLabel: "Honda Civic — ABC-1D23", clientId: "c1", clientName: "João Pereira", status: "a_fazer", payment: "pendente", price: 380, dueDate: "2025-04-22" },
  { id: "s2", title: "Revisão dos freios", description: "Pastilhas dianteiras + sangria.", carId: "v3", carLabel: "Chevrolet Onix — QWE-5R67", clientId: "c2", clientName: "Maria Silva", status: "em_andamento", payment: "adiantado", price: 620, dueDate: "2025-04-21" },
  { id: "s3", title: "Alinhamento e balanceamento", description: "Quatro rodas.", carId: "v4", carLabel: "Hyundai HB20 — RTY-8U90", clientId: "c3", clientName: "Roberto Lima", status: "concluido", payment: "pago", price: 180, dueDate: "2025-04-15" },
  { id: "s4", title: "Troca de embreagem", description: "Kit completo com volante.", carId: "v5", carLabel: "Jeep Compass — POI-9L88", clientId: "c3", clientName: "Roberto Lima", status: "a_fazer", payment: "adiantado", price: 2400, dueDate: "2025-04-25" },
  { id: "s5", title: "Suspensão dianteira", description: "Amortecedores + batentes.", carId: "v6", carLabel: "Jeep Renegade — MNB-7K33", clientId: "c4", clientName: "Ana Souza", status: "em_andamento", payment: "pendente", price: 1850, dueDate: "2025-04-23" },
  { id: "s6", title: "Diagnóstico eletrônico", description: "Scanner OBD + análise.", carId: "v7", carLabel: "Toyota Corolla — VFR-4D55", clientId: "c5", clientName: "Felipe Costa", status: "concluido", payment: "pago", price: 250, dueDate: "2025-04-12" },
  { id: "s7", title: "Troca de bateria", description: "Bateria 60Ah Moura.", carId: "v2", carLabel: "Toyota Hilux — BRA-2E45", clientId: "c1", clientName: "João Pereira", status: "concluido", payment: "pago", price: 720, dueDate: "2025-04-10" },
];

export const financialSummary = {
  totalRecebido: mockServices.filter(s => s.payment === "pago").reduce((a, s) => a + s.price, 0),
  totalAdiantado: mockServices.filter(s => s.payment === "adiantado").reduce((a, s) => a + s.price, 0),
  totalPendente: mockServices.filter(s => s.payment === "pendente").reduce((a, s) => a + s.price, 0),
  servicosAbertos: mockServices.filter(s => s.status !== "concluido").length,
};

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
