// @ts-nocheck
import type { FC } from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { ToastContainer } from '@hatyman/react-native-toasts';
import type { ToastNotification } from '@/services/toasts/toast-types.ts';
import { toastSharedStyles, ToastUI } from '@/services/toasts/ToastUI.tsx';
import RNHapticFeedback from 'react-native-haptic-feedback';

function notifyError() {
  RNHapticFeedback.trigger('impactHeavy');
}

export const ToastWrapper: FC = function ToastWrapper() {
  const {
    theme: { themedStyles },
  } = useUnistyles();

  return (
    <ToastContainer<ToastNotification>
      newErrorCallback={notifyError}
      ToastUIComponent={ToastUI}
      toastContainerStyle={[themedStyles.commonBGWithShadow, toastSharedStyles.toastContainer]}
    />
  );
};
