import * as React from 'react';
import {StyleSheet} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {HomeScreen} from './Home';
import screens from './screens';

const Stack = createNativeStackNavigator();

const App = () => (
  <GestureHandlerRootView style={styles.fill}>
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          {screens.map(x => (
            <Stack.Screen key={x.id} name={x.name} component={x.component} />
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

export default App;
