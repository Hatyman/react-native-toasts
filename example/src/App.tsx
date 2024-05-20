import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StackNavigator } from './StackNavigator';
import { ToastContainer, ToastProvider } from '@hatyman/react-native-toasts';
import { toastSharedStyles, ToastUI } from './toasts/ToastUI';
import type { ToastNotification } from './toasts/toast-types';

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NavigationContainer>
          <StackNavigator />
          <ToastContainer<ToastNotification>
            toastContainerStyle={toastSharedStyles.toastContainer}
            ToastUIComponent={ToastUI}
            newErrorCallback={() => {
              // vibrate
            }}
          />
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
