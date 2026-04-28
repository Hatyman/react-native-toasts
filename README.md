# @hatyman/react-native-toasts

Headless in-app toast system for React Native - you bring the visuals, the library handles state, layout, gestures, animation, and timers.

## Features

- **Headless rendering** - supply any React component as the toast UI; the library never assumes a specific look.
- **Reducer-based dispatch** - eight action variants for adding, replacing, patching, and dismissing toasts (single, by id, by message, by type, or all at once).
- **Stacked layout with measured re-flow** - heights are measured via `onLayout` and the stack re-animates whenever a toast enters or leaves.
- **Swipe-to-dismiss** with a 30% screen-width threshold; below that, the toast springs back.
- **Per-`ToastType` auto-dismiss** with `isPersistent` opt-out and per-toast timeout overrides.
- **AppState-aware timers** - auto-dismiss countdowns pause while the app is backgrounded and restart on resume, so tucked-away toasts do not silently expire.
- **Fully generic** - `BasicToastNotification<A, E>` lets you type the action payload and extra display fields without resorting to `any`.

## Installation

```sh
yarn add @hatyman/react-native-toasts
```

```sh
npm install @hatyman/react-native-toasts
```

### Peer dependencies

```sh
yarn add react-native-safe-area-context
```

You must wrap your app in `SafeAreaProvider` from [`react-native-safe-area-context`](https://github.com/th3rdwave/react-native-safe-area-context) - the library uses `useSafeAreaInsets` internally to position toasts below the status bar / notch.

## Quick start

```tsx
import React, { type FC } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  type BasicToastNotification,
  ToastContainer,
  ToastProvider,
  ToastType,
  useToastsDispatch,
} from '@hatyman/react-native-toasts';

const MyToastUI: FC<BasicToastNotification> = function MyToastUI(props) {
  return (
    <View style={styles.toast}>
      <Text style={styles.message}>{props.message}</Text>
    </View>
  );
};

function PushButton() {
  const dispatch = useToastsDispatch();
  return (
    <Button
      title={'push toast'}
      onPress={() => {
        dispatch({
          actionType: 'push',
          type: ToastType.Success,
          message: 'Saved!',
          isAutoDismissible: true,
        });
      }}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider areToastsAllowedByDefault>
        <View style={styles.app}>
          <PushButton />
        </View>
        <ToastContainer ToastUIComponent={MyToastUI} />
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, justifyContent: 'center' },
  toast: { backgroundColor: '#222', padding: 16, borderRadius: 8, marginHorizontal: 16 },
  message: { color: '#fff' },
});
```

## Integration order

The mounting order matters. From outermost to innermost:

1. **`SafeAreaProvider`** - peer requirement; provides the inset values used by every toast.
2. **`ToastProvider`** - owns the toast list and exposes the dispatch and allowance contexts. Place it above any component that calls `useToastsDispatch` or `useToastAllowance`.
3. Your app tree.
4. **`ToastContainer`** - render it as the **last child** of `ToastProvider`. It is absolute-positioned, so placing it last ensures toasts paint on top of the rest of the UI.

### Allowance gate

`ToastProvider` accepts `areToastsAllowedByDefault?: boolean` (default `false`). Use it together with the `useToastAllowance` hook when you need to suppress toasts during specific phases of the app - for instance, while a splash screen or onboarding flow is visible:

```tsx
import { useToastAllowance } from '@hatyman/react-native-toasts';

function SplashScreen({ onReady }: { onReady: () => void }) {
  const { setAreToastsAllowed } = useToastAllowance();
  return (
    <Button
      title={'Continue'}
      onPress={() => {
        setAreToastsAllowed(true);
        onReady();
      }}
    />
  );
}
```

The gate controls whether the layout pipeline processes incoming toasts; toggling it back to `false` does not eject toasts that are already on screen.

## Defining your toast type

`BasicToastNotification<A, E>` has two generic slots:

- `A` - the type of the optional `toastAction` payload (whatever your custom UI needs to invoke when the user taps the action button).
- `E` - an extension object intersected onto the toast (extra display fields like `icon`, `iconColor`, `dismissText`).

```ts
import type {
  BasicToastDispatchAction,
  BasicToastNotification,
} from '@hatyman/react-native-toasts';

type MyToastExtras = {
  icon?: string;
  iconColor?: string;
  dismissText?: string;
};

type MyToastAction =
  | { type: 'navigate'; payload: { screen: string } }
  | { type: 'retry' };

export type MyToast = BasicToastNotification<MyToastAction, MyToastExtras>;
export type MyToastDispatchAction = BasicToastDispatchAction<MyToast>;
```

Then parameterize the dispatch hook and the container:

```tsx
const dispatch = useToastsDispatch<MyToastDispatchAction>();

<ToastContainer<MyToast> ToastUIComponent={MyToastUI} />
```

The reducer is type-erased at runtime but typed via these generics at the dispatch boundary, so unknown fields on `MyToast` flow through to your UI component without `any`.

To avoid repeating the generic at every call site, export a pre-parameterized alias from the same module that defines your toast types:

```ts
import { useToastsDispatch } from '@hatyman/react-native-toasts';

export const useAppToastsDispatch = useToastsDispatch<MyToastDispatchAction>;
```

Then `useAppToastsDispatch()` returns a fully typed dispatcher, and the rest of the app never has to mention the generic.

## Dispatching toasts

All mutations go through `useToastsDispatch()`. The action shape is a discriminated union on `actionType`:

| `actionType`            | Payload (besides `actionType`)         | Effect                                                                |
|:------------------------|----------------------------------------|-----------------------------------------------------------------------|
| `push`                  | `Omit<T, 'id'>` - id is auto-generated | Prepend a new toast.                                                  |
| `distinct-id-push`      | `T` (caller-supplied `id`)             | Drop any existing toast with the same `id`, then prepend the new one. |
| `distinct-message-push` | `Omit<T, 'id'>`                        | Drop existing toasts with the same `message`, then prepend.           |
| `patch-by-id`           | `{ id } & Partial<T>`                  | Merge the supplied fields into the matching toast.                    |
| `hide-by-id`            | `{ id }`                               | Remove the toast with that id.                                        |
| `hide-by-message`       | `{ message }`                          | Remove every toast with that exact `message`.                         |
| `hide-by-type`          | `{ type }`                             | Remove every toast of that `ToastType`.                               |
| `hide-all`              | (none)                                 | Clear the stack.                                                      |

Example:

```tsx
const dispatch = useToastsDispatch<MyToastDispatchAction>();

dispatch({
  actionType: 'push',
  type: ToastType.Error,
  message: 'Could not save changes',
  isAutoDismissible: true,
  actionText: 'Retry',
  toastAction: { type: 'retry' },
});

dispatch({ actionType: 'hide-by-type', type: ToastType.Error });
```

### Handling toast actions

If you set `toastAction` on a toast, your `ToastUIComponent` is responsible for invoking it - the library never calls it for you. A clean pattern is to define a discriminated union of action types and route them through a single handler:

```ts
export enum NotificationActionId {
  NavigateTo = 'NavigateTo',
  RestartApp = 'RestartApp',
}

export type NotificationSharedAction =
  | { type: NotificationActionId.NavigateTo; payload: { screen: string } }
  | { type: NotificationActionId.RestartApp };

export async function callActionById(action: NotificationSharedAction): Promise<void> {
  switch (action.type) {
    case NotificationActionId.NavigateTo:
      navigateTo(action.payload.screen);
      break;
    case NotificationActionId.RestartApp:
      restartApp();
      break;
  }
}
```

Then in your `ToastUIComponent`, the action button does both the call and the dismiss:

```tsx
const dispatch = useAppToastsDispatch();

const onActionPress = () => {
  if (props.toastAction) {
    callActionById(props.toastAction).catch(e => {
      const error = new Error('Error on toast action executing');
      error.cause = e;
      console.warn(error);
    });
  }
  if (props.isPersistent) return;
  dispatch({ actionType: 'hide-by-id', id: props.id });
};
```

Skipping `hide-by-id` for `isPersistent` toasts lets you treat them as "must-acknowledge" notifications - the action runs, but the toast stays until something else dispatches a hide.

## API reference

### `ToastProvider`

| Prop                        | Type        | Default | Description                                                                                  |
|:----------------------------|-------------|---------|----------------------------------------------------------------------------------------------|
| `areToastsAllowedByDefault` | `boolean`   | `false` | Initial value of the allowance gate. Pair with `useToastAllowance` to flip it at runtime.    |
| `children`                  | `ReactNode` | -       | Your app tree. Mount `ToastContainer` as the last child so it renders above everything else. |

`useToastsDispatch` and `useToastAllowance` throw if called outside `ToastProvider`.

### `ToastContainer<T>`

Generic over `T extends BasicToastNotification`. Accepts:

| Prop                  | Type                   | Required | Description                                                                                                    |
|:----------------------|------------------------|----------|----------------------------------------------------------------------------------------------------------------|
| `ToastUIComponent`    | `FC<T>`                | yes      | Your toast renderer. Receives the full toast object as props (including everything in the `E` extension).      |
| `toastContainerStyle` | `StyleProp<ViewStyle>` | no       | Style merged on top of each toast's own `containerStyle` - typically used for shared shadow/elevation/margins. |
| `newErrorCallback`    | `() => void`           | no       | Fired whenever a new toast of `ToastType.Error` is added. Common use: trigger haptic feedback or sound.        |

### `Toast`

Low-level wrapper used internally by `ToastContainer` (handles layout, swipe, and the dismiss timer). Exported for completeness - for normal use, render through `ToastContainer`.

### `useToastsDispatch<T>()`

```ts
function useToastsDispatch<T extends BasicToastDispatchAction = BasicToastDispatchAction>(): Dispatch<T>;
```

Returns a typed dispatcher. Pass your custom `BasicToastDispatchAction<MyToast>` as `T` to get full autocomplete on the action payload.

### `useToastAllowance()`

```ts
function useToastAllowance(): {
  areToastsAllowed: boolean;
  setAreToastsAllowed: Dispatch<SetStateAction<boolean>>;
};
```

Read or toggle the rendering gate exposed by `ToastProvider`.

### `ToastType`

```ts
enum ToastType {
  Success,
  Error,
  Warning,
  Info,
}
```

Drives the default auto-dismiss timeout and is the discriminator most consumer UIs use to pick an icon and color.

### `BasicToastNotification<A, E>`

| Field                | Type                   | Description                                                                                     |
|:---------------------|------------------------|-------------------------------------------------------------------------------------------------|
| `id`                 | `string`               | Auto-generated for `push` / `distinct-message-push`; supply explicitly with `distinct-id-push`. |
| `message`            | `string`               | The text shown by the toast (your UI decides how to render it).                                 |
| `type`               | `ToastType`            | Determines the default timeout and is typically used by the UI to pick visuals.                 |
| `isPersistent`       | `boolean \| undefined` | When `true`, disables both swipe-to-dismiss and auto-dismiss.                                   |
| `isAutoDismissible`  | `boolean \| undefined` | When `true`, the dismiss timer runs.                                                            |
| `autoDismissTimeout` | `number \| undefined`  | Override (in ms) for the per-`type` default timeout.                                            |
| `testID`             | `string \| undefined`  | Forwarded to your `ToastUIComponent` (defaults to `${type}ToastUI` if not set).                 |
| `toastAction`        | `A \| undefined`       | Action payload for the action button - your UI decides what to do with it.                      |
| `actionText`         | `string \| undefined`  | Label for the action button (purely informational on this side).                                |
| `containerStyle`     | `StyleProp<ViewStyle>` | Per-toast style; merged with `toastContainerStyle` from the container.                          |
| ...`E`               | (your fields)          | Anything extra you want available in `ToastUIComponent`.                                        |

### `BasicToastDispatchAction<T>`

Discriminated union of the eight action variants - see the **Dispatching toasts** table above.

## Recommended structure

For non-trivial apps, isolate the toast configuration in a dedicated wrapper component instead of inlining `<ToastContainer>` in `App.tsx`. This keeps theming, error callbacks, and shared styles in one place and hides the generic argument from the app shell:

```tsx
import type { FC } from 'react';
import { ToastContainer } from '@hatyman/react-native-toasts';
import RNHapticFeedback from 'react-native-haptic-feedback';
import type { MyToast } from './toast-types';
import { ToastUI, toastSharedStyles } from './ToastUI';

function notifyError() {
  RNHapticFeedback.trigger('impactHeavy');
}

export const ToastWrapper: FC = function ToastWrapper() {
  return (
    <ToastContainer<MyToast>
      ToastUIComponent={ToastUI}
      newErrorCallback={notifyError}
      toastContainerStyle={toastSharedStyles.toastContainer}
    />
  );
};
```

`App.tsx` then only mounts it:

```tsx
<SafeAreaProvider>
  <ToastProvider areToastsAllowedByDefault={true}>
    <App />
    <ToastWrapper />
  </ToastProvider>
</SafeAreaProvider>
```

Pairs well with the `useAppToastsDispatch` alias from **Defining your toast type** - together they ensure no app-level code ever has to write the toast generics.

## Default auto-dismiss timeouts

The dismiss timer only runs when the toast has `isAutoDismissible: true`. Without `autoDismissTimeout`, these defaults apply:

| `ToastType` | Timeout |
|:------------|---------|
| `Success`   | 5 s     |
| `Error`     | 15 s    |
| `Warning`   | 10 s    |
| `Info`      | 10 s    |

`autoDismissTimeout` overrides per toast. `isPersistent: true` disables the timer entirely (and also disables swipe-to-dismiss).

## Behavior notes

- **Swipe threshold.** A horizontal pan that crosses 30% of the screen width dismisses the toast in the swipe direction; anything below springs back to center.
- **Backgrounded apps.** The dismiss timer is cleared when the app leaves the foreground and restarted from zero when it returns to `active`. Do not rely on toasts expiring at exact wall-clock times if the user might background the app mid-countdown.
- **Animation.** New toasts slide in from the right (`screenWidth → 0`). Dismissals slide out left or right depending on swipe direction; tap- or timer-driven dismissals slide out to the right by default.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, commit conventions, and release process.

## License

MIT - see [LICENSE](LICENSE).
