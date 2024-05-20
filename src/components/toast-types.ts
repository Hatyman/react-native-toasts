import type { Animated, StyleProp, ViewStyle } from 'react-native';

export enum ToastType {
  Success,
  Error,
  Warning,
  Info,
}

export type BasicToastNotification<A = unknown, E = unknown> = E & {
  id: string;
  message: string;
  type: ToastType;
  isPersistent?: boolean;
  autoDismissTimeout?: number;
  isAutoDismissible?: boolean;
  testID?: string;
  toastAction?: A;
  actionText?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export type BasicToastDispatchAction<T extends BasicToastNotification = BasicToastNotification> =
  | ({
      actionType: 'push';
    } & Omit<T, 'id'>)
  | ({
      actionType: 'distinct-id-push';
    } & T)
  | ({
      actionType: 'distinct-message-push';
    } & Omit<T, 'id'>)
  | ({
      actionType: 'patch-by-id';
    } & Pick<T, 'id'> &
      Partial<T>)
  | ({
      actionType: 'hide-by-message';
    } & Pick<T, 'message'>)
  | ({
      actionType: 'hide-by-id';
    } & Pick<T, 'id'>)
  | ({
      actionType: 'hide-by-type';
    } & Pick<T, 'type'>)
  | {
      actionType: 'hide-all';
    };

export type ToastAuxiliaryInfo = {
  height: number;
  closeToLeft: boolean;
  animatedValue: Animated.ValueXY;
};
export type ToastsAuxiliaryInfoRecord = Record<string, ToastAuxiliaryInfo>;
