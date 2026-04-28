// @ts-nocheck
import { ToastType, useToastsDispatch } from '@hatyman/react-native-toasts';
import React, { type FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { TouchableOpacity } from '@/components/TouchableOpacity.tsx';
import { layoutPadding, UXTapZone } from '@/consts/layout-consts.ts';
import type { BackgroundThemedStyleVariants } from '@/providers/AppThemeProvider';
import { useUnistyles } from 'react-native-unistyles';
import { callActionById } from '@/services/toasts/toast-action.ts';
import type { ToastNotification } from '@/services/toasts/toast-types.ts';
import { sharedLayoutStyles } from '@/styles/shared-layout-styles.ts';
import { ActivityIndicator } from '@/ui-kit/components/ActivityIndicator.tsx';
import { Typography } from '@/ui-kit/components/Typography.tsx';
import { IconEnum, TextColorEnum } from '@/ui-kit/ui-kit-constants.ts';

import { oLogger } from '../logger';

const iconConfigs = {
  [ToastType.Success]: {
    name: IconEnum.Mark16,
    colorVariant: 'green200BG',
  },
  [ToastType.Error]: {
    name: IconEnum.Error16,
    colorVariant: 'red200BG',
  },
  [ToastType.Warning]: {
    name: IconEnum.Error16,
    colorVariant: 'yellow200BG',
  },
  [ToastType.Info]: {
    name: IconEnum.Notification24,
    colorVariant: 'beige200BG',
  },
} as const;

export const ToastUI: FC<ToastNotification> = function ToastUI(props) {
  const {
    theme: { themedStyles },
  } = useUnistyles();

  const dispatch = useToastsDispatch();
  const closeToast = () => {
    dispatch({
      actionType: 'hide-by-id',
      id: props.id,
    });
  };
  const callToastActionAndClose = () => {
    if (props.toastAction) {
      callActionById(props.toastAction).catch(e => {
        const error = new Error('Error on toast action executing');
        error.cause = e;
        oLogger.warn(error);
      });
    }
    if (props.isPersistent) return;

    closeToast();
  };

  const iconConfig = iconConfigs[props.type];

  const hasButton = Boolean(props.actionText || props.dismissText);
  const twoButtons = Boolean(props.actionText && props.dismissText);

  const iconColorVariant: BackgroundThemedStyleVariants =
    props.iconColorVariant || iconConfig.colorVariant || 'beige200BG';

  return (
    <View testID={props.testID}>
      <View
        style={StyleSheet.compose(ownStyles.content, !hasButton && ownStyles.contentWithoutButton)}
      >
        <View style={[ownStyles.iconContainer, themedStyles[iconColorVariant]]}>
          {props.showActivityIndicator ? (
            <ActivityIndicator size={16} colorVariant={'white'} />
          ) : (
            <Typography
              icon={props.icon || iconConfig.name || IconEnum.Info24}
              size={16}
              colorVariant={'white'}
            />
          )}
        </View>
        <Typography
          size={14}
          colorVariant={props.textColorVariant || TextColorEnum.Primary}
          style={ownStyles.message}
          testID={'message'}
        >
          {props.message}
        </Typography>
      </View>
      {hasButton && (
        <View style={ownStyles.buttonsContainer}>
          {props.dismissText && (
            <TouchableOpacity
              testID={props.dismissText}
              onPress={closeToast}
              style={ownStyles.button}
              hitSlop={UXTapZone}
            >
              <Typography size={14} colorVariant={props.dismissTextColorVariant || 'red200'}>
                {props.dismissText}
              </Typography>
            </TouchableOpacity>
          )}
          {twoButtons && <View style={[ownStyles.separator, themedStyles.primary400BG]} />}
          {props.actionText && (
            <TouchableOpacity
              testID={props.actionText}
              onPress={callToastActionAndClose}
              style={ownStyles.button}
              hitSlop={UXTapZone}
            >
              <Typography size={14} colorVariant={props.textColorVariant || TextColorEnum.Primary}>
                {props.actionText}
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const ownStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 5,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 3,
  },
  contentWithoutButton: {
    paddingBottom: 16,
  },
  iconContainer: {
    ...sharedLayoutStyles.center,
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  button: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
    flexBasis: '15%',
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  separator: {
    height: '60%',
    alignSelf: 'center',
    width: 1,
  },

  message: {
    flex: 1,
    marginLeft: 10,
  },
});

export const toastSharedStyles = StyleSheet.create({
  toastContainer: {
    borderRadius: 20,
    marginHorizontal: layoutPadding,
  },
});
