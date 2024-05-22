import React, {
  createContext,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { toastReducer } from '../services/toast-reducer';
import type { BasicToastDispatchAction, BasicToastNotification } from './toast-types';

type ToastContextType = BasicToastNotification[];
const defaultToasts: ToastContextType = [];
const ToastContext = createContext<ToastContextType>(defaultToasts);
const ToastDispatchContext = createContext<Dispatch<BasicToastDispatchAction>>(() => {});

interface OwnProps extends PropsWithChildren {
  areToastsAllowedByDefault?: boolean;
}

type ToastsAllowanceContextType = {
  areToastsAllowed: boolean;
  setAreToastsAllowed: Dispatch<SetStateAction<boolean>>;
};
const ToastsAllowanceContext = createContext<ToastsAllowanceContextType>({
  areToastsAllowed: false,
  setAreToastsAllowed: () => {},
});

export const ToastProvider: FC<OwnProps> = function ToastProvider(props) {
  const [state, dispatch] = useReducer(toastReducer, defaultToasts);
  const [areToastsAllowed, setAreToastsAllowed] = useState<boolean>(
    Boolean(props.areToastsAllowedByDefault)
  );

  const value = useMemo<ToastsAllowanceContextType>(
    () => ({
      areToastsAllowed,
      setAreToastsAllowed,
    }),
    [areToastsAllowed]
  );

  return (
    <ToastContext.Provider value={state}>
      <ToastDispatchContext.Provider value={dispatch}>
        <ToastsAllowanceContext.Provider value={value}>
          {props.children}
        </ToastsAllowanceContext.Provider>
      </ToastDispatchContext.Provider>
    </ToastContext.Provider>
  );
};

export function useToasts() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToasts must be used within a ToastProvider');
  }

  return context;
}

export function useToastsDispatch<T extends BasicToastDispatchAction = BasicToastDispatchAction>() {
  const context = useContext(ToastDispatchContext);

  if (context === undefined) {
    throw new Error('useToastsDispatch must be used within a ToastProvider');
  }

  return context as Dispatch<T>;
}

export function useToastAllowance() {
  const context = useContext(ToastsAllowanceContext);

  if (context === undefined) {
    throw new Error('useToastAllowance must be used within a ToastProvider');
  }

  return context;
}
