import type { AppParamList } from '../navigation-types';

export enum NotificationActionId {
  NavigateTo = 'NavigateTo',
  RestartApp = 'RestartApp',
}

// Sum actions with different types for payloads
export type NotificationSharedAction = NotificationNavigateTo | NotificationRestartApp;

export type NotificationNavigateTo<T extends keyof AppParamList = keyof AppParamList> = {
  type: NotificationActionId.NavigateTo;
  payload: { screen: T; params?: AppParamList[T] };
};

export type NotificationRestartApp = {
  type: NotificationActionId.RestartApp;
};
