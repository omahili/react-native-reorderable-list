import React from 'react';
import {StyleSheet, Text, View, ViewProps} from 'react-native';

import {useHorizontal} from '../common';

interface TitleHighlightProps extends ViewProps {
  title: string;
}

export const TitleHighlight: React.FC<TitleHighlightProps> = ({
  title,
  style,
  ...rest
}) => {
  const {horizontal} = useHorizontal();

  return (
    <View
      style={[
        styles.container,
        horizontal ? styles.horizontalContainer : styles.verticalContainer,
        style,
      ]}
      {...rest}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
  },
  container: {
    backgroundColor: 'lightblue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalContainer: {
    padding: 16,
  },
  horizontalContainer: {
    height: '100%',
    padding: 4,
  },
});
