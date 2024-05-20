import React, { type FC, Fragment } from 'react';
import { Toast, useControlledToasts } from '@hatyman/react-native-toasts';
import type { BasicToastNotification } from './toast-types';
import type { StyleProp, ViewStyle } from 'react-native';

type OwnProps<T extends BasicToastNotification> = {
  newErrorCallback?: () => void;
  toastContainerStyle?: StyleProp<ViewStyle>;
  ToastUIComponent: FC<T>;
};

export const ToastContainer = function ToastContainer<T extends BasicToastNotification>(
  props: OwnProps<T>
) {
  const { toasts, getToastInfo, getOnLayoutHandler } = useControlledToasts<T>(
    props.newErrorCallback
  );

  const ToastUI = props.ToastUIComponent;

  return (
    <Fragment>
      {toasts.map(toast => {
        const toastInfo = getToastInfo(toast.id);
        return (
          <Toast
            key={toast.id}
            toastInfo={toastInfo}
            onLayout={getOnLayoutHandler(toastInfo)}
            {...toast}
            style={[toast.containerStyle, props.toastContainerStyle]}
          >
            <ToastUI {...toast} testID={toast.testID || `${toast.type.toString()}ToastUI`} />
          </Toast>
        );
      })}
    </Fragment>
  );
};
