import React, { type FC } from 'react';
import { ToastType, useToastsDispatch } from '@hatyman/react-native-toasts';
import type { ToastDispatchAction, ToastNotification } from './toast-types';
import { callActionById } from './toast-action';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Icon,
  TextColorEnum,
  Typography,
  useAppTheme,
  useThemedStyles,
  useUIKitTheme,
} from '../stubs/stubs';

function getIconConfigs(appTheme: any) {
  return {
    [ToastType.Success]: {
      name: 'mark',
      color: appTheme.green200,
    },
    [ToastType.Error]: {
      name: 'cross',
      color: appTheme.red200,
    },
    [ToastType.Warning]: {
      name: 'warning',
      color: appTheme.orange200,
    },
    [ToastType.Info]: {
      name: 'info',
      color: appTheme.primary400,
    },
  };
}

export const ToastUI: FC<ToastNotification> = function ToastUI(props) {
  const themedStyles = useThemedStyles();
  const appTheme = useAppTheme();

  const iconConfigs = useUIKitTheme('ToastUI-iconConfigs', getIconConfigs);

  const dispatch = useToastsDispatch<ToastDispatchAction>();
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
        console.warn(error);
      });
    }
    closeToast();
  };

  const iconConfig = iconConfigs[props.type];

  const hasButton = Boolean(props.actionText || props.dismissText);
  const twoButtons = Boolean(props.actionText && props.dismissText);

  const iconColor = props.iconColor || iconConfig.color || appTheme.primary400;
  return (
    <View style={ownStyles.container} testID={props.testID}>
      <View
        style={StyleSheet.compose(ownStyles.content, !hasButton && ownStyles.contentWithoutButton)}
      >
        {props.showActivityIndicator ? (
          <ActivityIndicator size={24} color={iconColor} />
        ) : (
          <Icon name={props.icon || iconConfig.name || 'info'} size={24} color={iconColor} />
        )}
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
            >
              <Typography colorVariant={props.dismissTextColorVariant || TextColorEnum.Secondary}>
                {props.dismissText}
              </Typography>
            </TouchableOpacity>
          )}
          {twoButtons && <View style={[ownStyles.separator, themedStyles.secondary500BG]} />}
          {props.actionText && (
            <TouchableOpacity
              testID={props.actionText}
              onPress={callToastActionAndClose}
              style={ownStyles.button}
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

  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
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
    borderRadius: 10,
    marginHorizontal: 16,
    elevation: 6,
    shadowRadius: 3.7,
    shadowOpacity: 0.5,
  },
});
