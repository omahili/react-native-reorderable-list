import React from 'react';
import {StyleSheet, Text, View, ViewProps} from 'react-native';

interface TitleHighlightProps extends ViewProps {
  title: string;
}

export const TitleHighlight: React.FC<TitleHighlightProps> = ({
  title,
  style,
  ...rest
}) => (
  <View style={[styles.container, style]} {...rest}>
    <Text style={styles.text}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
  },
  container: {
    height: 50,
    backgroundColor: 'lightblue',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
