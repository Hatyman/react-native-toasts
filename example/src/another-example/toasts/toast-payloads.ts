// @ts-nocheck
import { type AppStackParamList } from '@/types/navigation-types.ts';
import { useToastsDispatch } from '@hatyman/react-native-toasts';
import type { ToastDispatchAction } from '@/services/toasts/toast-types.ts';

export enum NotificationActionId {
  NavigateTo = 'NavigateTo',
  RestartApp = 'RestartApp',
  CustomCallback = 'CustomCallback',
  OpenAppStore = 'OpenAppStore',
}

// Sum actions with different types for payloads
export type NotificationSharedAction =
  | NotificationNavigateTo
  | NotificationWithoutPayload
  | NotificationCustomCallback;

export type NotificationNavigateTo<T extends keyof AppStackParamList = keyof AppStackParamList> = {
  type: NotificationActionId.NavigateTo;
  payload: { screen: T; params?: AppStackParamList[T] };
};

export type NotificationWithoutPayload = {
  type: NotificationActionId.RestartApp | NotificationActionId.OpenAppStore;
};

export type NotificationCustomCallback = {
  type: NotificationActionId.CustomCallback;
  payload: { callback: () => void | Promise<void> };
};

export const useAppToastsDispatch = useToastsDispatch<ToastDispatchAction>;
