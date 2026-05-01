import { useEffect } from 'react';
import {
    requestNotificationPermission,
    scheduleNotifications,
} from '../services/notificationService';

export function useNotifications() {
  useEffect(() => {
    async function init() {
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleNotifications();
      }
    }
    init();
  }, []);
}