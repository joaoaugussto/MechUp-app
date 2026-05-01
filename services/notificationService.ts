import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { api } from './api'; // ajuste o caminho se necessário

const KEYS = {
  osNotif: '@mechup:osNotif',
  payNotif: '@mechup:payNotif',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function saveNotifPreference(key: 'osNotif' | 'payNotif', value: boolean) {
  await AsyncStorage.setItem(KEYS[key], JSON.stringify(value));
}

export async function loadNotifPreference(key: 'osNotif' | 'payNotif'): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS[key]);
  return val === null ? true : JSON.parse(val); // default true
}

export async function scheduleNotifications() {
  const osNotif = await loadNotifPreference('osNotif');
  const payNotif = await loadNotifPreference('payNotif');

  // Cancela todas anteriores para não duplicar
  await Notifications.cancelAllScheduledNotificationsAsync();

  const services = await api.getServices();
  if (!Array.isArray(services)) return;

  const now = new Date();

  for (const service of services) {
    // OS próximas do prazo (próximos 2 dias, status ativo)
    if (osNotif && service.dueDate) {
      const due = new Date(service.dueDate);
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      const isActive = !['concluido', 'cancelado'].includes(service.status);

      if (diffDays >= 0 && diffDays <= 2 && isActive) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⚠️ OS próxima do prazo',
            body: `"${service.title}" vence em ${Math.ceil(diffDays)} dia(s).`,
          },
          trigger: null, // dispara imediatamente
        });
      }
    }

    // Pagamentos pendentes
    if (payNotif && service.payment === 'pendente') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 Pagamento pendente',
          body: `"${service.title}" ainda não foi pago.`,
        },
        trigger: null,
      });
    }
  }
}