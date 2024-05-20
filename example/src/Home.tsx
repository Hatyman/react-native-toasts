import type { FC } from 'react';
import { Button, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastType, useToastsDispatch } from '@hatyman/react-native-toasts';
import type { ToastDispatchAction } from './toasts/toast-types';

export const Home: FC = function Home() {
  const insets = useSafeAreaInsets();
  const dispatch = useToastsDispatch<ToastDispatchAction>();

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
      <Button
        title={'push toast'}
        onPress={() => {
          dispatch({
            actionType: 'push',
            type: ToastType.Error,
            message: 'Test push',
            isAutoDismissible: true,
          });
        }}
      />
    </ScrollView>
  );
};
