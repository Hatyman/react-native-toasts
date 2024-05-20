import type { FC } from 'react';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { Home } from './Home';
import type { AppParamList } from './navigation-types';

const Stack = createNativeStackNavigator<AppParamList>();

export const StackNavigator: FC = function () {
  return (
    <Stack.Navigator>
      <Stack.Screen name={'Home'} children={Home} />
    </Stack.Navigator>
  );
};
