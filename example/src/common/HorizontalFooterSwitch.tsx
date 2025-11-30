import * as React from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';

import {useHorizontal} from './HorizontalContext';

export const HorizontalFooterSwitch = () => {
  const {horizontal, setHorizontal} = useHorizontal();

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Horizontal</Text>
        <Switch
          value={horizontal}
          onChange={() => setHorizontal(value => !value)}
        />
      </View>
      <Text style={styles.footnote}>
        Flip phone for best horizontal experience.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 0,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  switchText: {
    fontSize: 16,
    color: 'black',
  },
  footnote: {
    fontSize: 14,
    color: '#777',
  },
});
