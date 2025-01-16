import React, {memo, useState} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import {useReorderableDrag} from 'react-native-reorderable-list';

interface RandomListItemProps {
  id: string;
  height: number;
}

export const RandomListItem: React.FC<RandomListItemProps> = memo(
  ({id, height}) => {
    const drag = useReorderableDrag();
    const [number, setNumber] = useState(0);

    return (
      <Pressable
        style={[styles.card, {height}]}
        onPress={() => setNumber(number + 1)}
        onLongPress={drag}>
        <Text style={styles.text}>
          {id}-{number}
        </Text>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: 'lightgray',
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
});
