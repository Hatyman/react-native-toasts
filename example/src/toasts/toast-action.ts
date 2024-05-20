import { NotificationActionId, type NotificationSharedAction } from './toast-payloads';

export async function callActionById(action: NotificationSharedAction): Promise<void> {
  switch (action.type) {
    case NotificationActionId.NavigateTo:
      // navigateTo(action.payload.screen, action.payload.params);
      break;

    case NotificationActionId.RestartApp:
      // restartApp();
      break;

    default:
    // assertNever(action);
  }
}
