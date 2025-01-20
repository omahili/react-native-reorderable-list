import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface TitleHighlightProps {
  title: string;
}

export const TitleHighlight: React.FC<TitleHighlightProps> = ({title}) => (
  <View style={styles.container}>
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
