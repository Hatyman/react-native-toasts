import { useEffect, useRef, useState } from 'react';
import { Animated, type LayoutChangeEvent } from 'react-native';
import { useToastAllowance, useToasts } from '../components/ToastProvider';
import {
  type BasicToastNotification,
  type ToastAuxiliaryInfo,
  type ToastsAuxiliaryInfoRecord,
  ToastType,
} from '../components/toast-types';
import { defaultToastHeight, screenWidth } from '../consts/layout-consts';

const toastOffset = 8;

const animationConfig = {
  duration: 200,
  useNativeDriver: true,
};

const openAnimationConfig: Animated.TimingAnimationConfig = {
  ...animationConfig,
  toValue: 0,
};

function animateToast(
  animatedValue: Animated.Value,
  toValue: number,
  callback?: (result: Animated.EndResult) => void
) {
  Animated.timing(animatedValue, {
    ...animationConfig,
    toValue,
  }).start(callback);
}

export function useControlledToasts<T extends BasicToastNotification = BasicToastNotification>(
  newErrorCallback?: () => Promise<void> | void
) {
  const toasts = useToasts() as T[];
  const { areToastsAllowed } = useToastAllowance();

  const toastsInfo = useRef<ToastsAuxiliaryInfoRecord>({});

  const [cachedToasts, setCachedToasts] = useState<T[]>(toasts as T[]);

  const closeToast = (toastId: string): Promise<void> | null => {
    const toastInfo = toastsInfo.current[toastId];
    if (!toastInfo) return null;

    toastInfo.animatedValue.x.removeAllListeners();
    return new Promise(resolve => {
      Animated.timing(toastInfo.animatedValue.x, {
        ...animationConfig,
        toValue: toastInfo.closeToLeft ? -screenWidth : screenWidth,
      }).start(() => {
        // maybe we should use it with finished condition
        toastInfo.animatedValue.y.setValue(0);
        resolve();
        delete toastsInfo.current[toastId];
      });
    });
  };

  useEffect(() => {
    if (!areToastsAllowed) return;

    (async () => {
      let closeTaskPromise: Promise<void> | null = null;
      const toastIndexesConnectionMap = new Map<number, number>();

      // animate closing alarms
      let index = 0;
      for (const cachedToast of cachedToasts) {
        const toastId = cachedToast.id;
        const currentToastIndex = toasts.findIndex(toast => toast.id === toastId);

        if (currentToastIndex === -1) {
          closeTaskPromise = closeToast(toastId);
        } else {
          toastIndexesConnectionMap.set(currentToastIndex, index);
        }

        index++;
      }

      if (closeTaskPromise) await closeTaskPromise;

      let isThereNewErrorToast = false;

      let topOffset = toastOffset;
      const newCachedToasts = toasts.map((toast, i) => {
        const oldIndex = toastIndexesConnectionMap.get(i);
        const isNewToast = oldIndex === undefined;

        const toastId = toast.id;

        isThereNewErrorToast =
          isThereNewErrorToast || (toast.type === ToastType.Error && isNewToast);

        if (isNewToast) {
          const toastLayoutConfig: ToastAuxiliaryInfo = {
            closeToLeft: false,
            height: defaultToastHeight,
            animatedValue: new Animated.ValueXY({
              x: screenWidth,
              y: topOffset,
            }),
          };
          toastsInfo.current[toastId] = toastLayoutConfig;
          // animate new toast from right
          Animated.timing(toastLayoutConfig.animatedValue.x, openAnimationConfig).start();

          topOffset += toastLayoutConfig.height + toastOffset;
        } else {
          const toastInfo = toastsInfo.current[toastId];

          if (toastInfo) {
            animateToast(toastInfo.animatedValue.y, topOffset);
          }

          topOffset += (toastInfo?.height || 0) + toastOffset;
        }

        return { ...toast };
      });

      if (isThereNewErrorToast && newErrorCallback) {
        newErrorCallback();
      }

      setCachedToasts(newCachedToasts);
    })();
  }, [toasts, areToastsAllowed]);

  const reanimateEverything = () => {
    let currentTop = toastOffset;
    for (const toast of cachedToasts) {
      const toastInfo = toastsInfo.current[toast.id];
      if (!toastInfo) continue;

      animateToast(toastInfo.animatedValue.y, currentTop);
      currentTop += toastInfo.height + toastOffset;
    }
  };

  return {
    toasts: cachedToasts,
    getToastInfo: (toastId: string) => toastsInfo.current[toastId],
    getOnLayoutHandler: (toastInfo: ToastAuxiliaryInfo | undefined) => {
      if (!toastInfo) return undefined;

      return ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
        toastInfo.height = layout.height;
        // this might be optimized in the future, so it's only called once for rerender
        reanimateEverything();
      };
    },
  };
}
