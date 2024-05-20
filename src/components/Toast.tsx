import React, {
  type FC,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Animated,
  AppState,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  PanResponder,
  type PanResponderGestureState,
  StatusBar,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TimerType } from '../utils/type-utils';
import { isStateActive, useAppRestoredFromBackground } from '../hooks/useAppRestoredFromBackground';
import { type BasicToastNotification, type ToastAuxiliaryInfo, ToastType } from './toast-types';
import { useToastsDispatch } from './ToastProvider';
import { defaultToastHeight, screenWidth } from '../consts/layout-consts';

const millisecondsInSecond = 1000;
const ToastTimeouts = {
  [ToastType.Success]: 5 * millisecondsInSecond,
  [ToastType.Error]: 15 * millisecondsInSecond,
  [ToastType.Warning]: 10 * millisecondsInSecond,
  [ToastType.Info]: 10 * millisecondsInSecond,
};

type OwnProps = BasicToastNotification & {
  onLayout?: (e: LayoutChangeEvent) => void;
  toastInfo: ToastAuxiliaryInfo | undefined;
  style?: StyleProp<ViewStyle>;
};

export const Toast: FC<PropsWithChildren<OwnProps>> = function Toast(props) {
  const { top } = useSafeAreaInsets();
  const timerId = useRef<TimerType | null>(null);
  const dispatch = useToastsDispatch();

  const toastId = props.id;

  const closeToast = () => {
    dispatch({
      actionType: 'hide-by-id',
      id: toastId,
    });
  };

  const isPersistent = props.isPersistent;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
          if (!props.toastInfo) return;
          Animated.event([null, { dx: props.toastInfo.animatedValue.x }], {
            useNativeDriver: false,
          })(_event, gesture);
        },
        onPanResponderTerminate: () => false,
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: (_, gesture: PanResponderGestureState) => {
          if (!props.toastInfo) return;
          if (!isPersistent && Math.abs(gesture.dx) >= 0.3 * screenWidth) {
            props.toastInfo.closeToLeft = gesture.dx < 0;
            closeToast();
          } else if (props.toastInfo.animatedValue) {
            Animated.spring(props.toastInfo.animatedValue.x, {
              toValue: 0,
              bounciness: 20,
              useNativeDriver: true,
            }).start();
          } else {
            // do nothing
          }
        },
      }),
    []
  );

  const clearDismissTimeout = () => {
    if (timerId.current) {
      clearTimeout(timerId.current);
      timerId.current = null;
    }
  };

  const setupDismissTimeout = useCallback(() => {
    clearDismissTimeout();
    if (props.isAutoDismissible) {
      timerId.current = setTimeout(
        closeToast,
        props.autoDismissTimeout ?? ToastTimeouts[props.type]
      );
    }
  }, [props.isAutoDismissible]);

  // dismiss timer for toasts starts when the app is restored from the background
  useAppRestoredFromBackground(setupDismissTimeout, undefined, {
    resubscribeIfHandlerChanges: true,
  });

  useEffect(
    function handleNewToast() {
      if (isStateActive(AppState.currentState)) {
        setupDismissTimeout();
      }

      return clearDismissTimeout;
    },
    [setupDismissTimeout]
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        ownStyles.toast,
        props.style,
        {
          transform: [
            { translateX: props.toastInfo?.animatedValue.x || 0 },
            { translateY: props.toastInfo?.animatedValue.y || 0 },
          ],
          marginTop: top || StatusBar.currentHeight,
        },
      ]}
      onLayout={props.onLayout}
    >
      {props.children}
    </Animated.View>
  );
};

const ownStyles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 0,
    right: 0,
    minHeight: defaultToastHeight,
  },
});
