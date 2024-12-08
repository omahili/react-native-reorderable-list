import React, {memo, useState} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import {
  ReorderableListItem,
  useReorderableDrag,
} from 'react-native-reorderable-list';

const scaleAnimationConfig = {valueStart: 1.1};

interface RandomListItemProps {
  id: string;
  height: number;
}

export const RandomListItem: React.FC<RandomListItemProps> = memo(
  ({id, height}) => {
    const drag = useReorderableDrag();
    const [number, setNumber] = useState(0);

    return (
      <ReorderableListItem scaleAnimationConfig={scaleAnimationConfig}>
        <Pressable
          style={[styles.card, {height}]}
          onPress={() => setNumber(number + 1)}
          onLongPress={drag}>
          <Text style={styles.text}>
            {id}-{number}
          </Text>
        </Pressable>
      </ReorderableListItem>
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
  },
});
