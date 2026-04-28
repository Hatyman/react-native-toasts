// @ts-nocheck
import { NotificationActionId, type NotificationSharedAction } from './toast-payloads';
import { navigateTo } from '@/navigators';
import { Linking } from 'react-native';
import { appStoreLink } from '@/consts/common-consts.ts';

export async function callActionById(action: NotificationSharedAction): Promise<void> {
  switch (action.type) {
    case NotificationActionId.NavigateTo:
      navigateTo(action.payload.screen, action.payload.params);
      break;

    case NotificationActionId.RestartApp:
      // restartApp();
      break;

    case NotificationActionId.CustomCallback:
      await action.payload.callback();
      break;

    case NotificationActionId.OpenAppStore:
      await Linking.openURL(appStoreLink);
      break;

    default:
    // assertNever(action);
  }
}
