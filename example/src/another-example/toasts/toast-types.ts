// @ts-nocheck
import type { NotificationSharedAction } from './toast-payloads';
import type {
  BasicToastDispatchAction,
  BasicToastNotification,
} from '@hatyman/react-native-toasts';
import { IconEnum, type TextColorEnum } from '@/ui-kit/ui-kit-constants.ts';
import type { BackgroundThemedStyleVariants } from '@/providers/AppThemeProvider.tsx';

type ToastExtraConfig = {
  textColorVariant?: TextColorEnum;
  dismissTextColorVariant?: TextColorEnum;
  icon?: IconEnum;
  showActivityIndicator?: boolean;
  dismissText?: string;
  iconColorVariant?: BackgroundThemedStyleVariants;
};

export type ToastNotification = BasicToastNotification<NotificationSharedAction, ToastExtraConfig>;
export type ToastDispatchAction = BasicToastDispatchAction<ToastNotification>;
