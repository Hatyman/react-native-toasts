import type {
  BasicToastDispatchAction,
  BasicToastNotification,
} from '@hatyman/react-native-toasts';
import type { NotificationSharedAction } from './toast-payloads';

type ToastExtraConfig = {
  textColorVariant?: 'primary' | 'secondary';
  dismissTextColorVariant?: 'primary' | 'secondary';
  icon?: string;
  showActivityIndicator?: boolean;
  iconColor?: string;
  dismissText?: string;
};

export type ToastNotification = BasicToastNotification<NotificationSharedAction, ToastExtraConfig>;
export type ToastDispatchAction = BasicToastDispatchAction<ToastNotification>;
