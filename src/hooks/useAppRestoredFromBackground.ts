import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export function isStateActive(state: AppStateStatus): boolean {
  return state === 'active';
}

type AppStateHookOptions = {
  resubscribeIfHandlerChanges?: boolean;
};
/**
 * This hook executes passed function when the app is restored from the background.
 * This is a general infrastructure hook, **no application-related functionality
 * should be added here**.
 */
export const useAppRestoredFromBackground = (
  cameFromBackgroundHandler: () => void,
  wentToBackgroundHandler?: () => void,
  options?: AppStateHookOptions
) => {
  const appStateRef = useRef<AppStateStatus>('active');
  const isResubscribeEnabled = useRef<boolean>(
    Boolean(options?.resubscribeIfHandlerChanges)
  ).current;

  const deps = isResubscribeEnabled && cameFromBackgroundHandler;
  const appRestoredFromBackgroundHandler = useCallback(
    async (nextAppState: AppStateStatus) => {
      const prevState = appStateRef.current;

      if (!isStateActive(prevState) && isStateActive(nextAppState)) {
        cameFromBackgroundHandler();
      } else if (
        wentToBackgroundHandler &&
        isStateActive(prevState) &&
        !isStateActive(nextAppState)
      ) {
        wentToBackgroundHandler();
      } else {
        // do nothing
      }

      appStateRef.current = nextAppState;
    },
    [deps]
  );
  useEffect(() => {
    const subscription = AppState.addEventListener('change', appRestoredFromBackgroundHandler);
    return () => {
      subscription.remove();
    };
  }, [appRestoredFromBackgroundHandler]);
};
