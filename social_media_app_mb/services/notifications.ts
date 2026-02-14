import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    try {
      // Check if running in Expo Go (appOwnership is 'expo')
      if (Constants.appOwnership === 'expo' && Platform.OS === 'android') {
        console.warn('Push notifications are limited in Expo Go on Android SDK 53+. Use a development build for full support.');
      }

      token = (await Notifications.getDevicePushTokenAsync()).data;
      console.log('Push notification token:', token);
    } catch (error) {
      console.warn('Error getting push token (this is expected in Expo Go on Android):', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
};

export const schedulePushNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { data: 'goes here' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    } as Notifications.NotificationTriggerInput,
  });
};

export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(callback);
};

export const addNotificationResponseReceivedListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Helper function to safely remove notification subscriptions
export const removeNotificationSubscription = (
  subscription: Notifications.Subscription | undefined
) => {
  if (subscription) {
    subscription.remove();
  }
};
