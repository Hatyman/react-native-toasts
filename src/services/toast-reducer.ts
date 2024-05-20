import type { BasicToastDispatchAction, BasicToastNotification } from '../components/toast-types';
import { createId } from '../utils/text-utils';

export function toastReducer(
  state: BasicToastNotification[],
  action: BasicToastDispatchAction
): BasicToastNotification[] {
  const newState: BasicToastNotification[] = [];

  switch (action.actionType) {
    case 'push':
      return [
        {
          id: createId(),
          ...action,
        },
        ...state,
      ];
    case 'distinct-id-push':
      newState.push({
        ...action,
      });

      for (const toast of state) {
        if (toast.id === action.id) continue;

        newState.push(toast);
      }

      return newState;
    case 'distinct-message-push':
      newState.push({
        id: createId(),
        ...action,
      });

      for (const toast of state) {
        if (toast.message === action.message) continue;

        newState.push(toast);
      }

      return newState;
    case 'patch-by-id':
      for (const toast of state) {
        if (toast.id !== action.id) {
          newState.push(toast);
          continue;
        }

        newState.push({
          ...toast,
          ...action,
        });
      }

      return newState;
    case 'hide-by-id':
      return state.filter(toast => toast.id !== action.id);
    case 'hide-by-message':
      return state.filter(toast => toast.message !== action.message);
    case 'hide-by-type':
      return state.filter(toast => toast.type !== action.type);
    case 'hide-all':
      return [];
    default:
      return state;
  }
}
