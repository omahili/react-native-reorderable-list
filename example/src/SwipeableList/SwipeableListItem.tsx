import React, {memo} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import Swipeable from 'react-native-gesture-handler/Swipeable';

import {ListItem, ListItemProps} from '../common';

interface SwipeableListItemProps extends ListItemProps {
  id: string;
  onDeletePress: (id: string) => void;
}

export const SwipeableListItem: React.FC<SwipeableListItemProps> = memo(
  ({id, onDeletePress, ...rest}) => {
    const renderRightActions = () => (
      <Pressable
        style={styles.deleteContainer}
        onPress={() => onDeletePress(id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    );

    return (
      <Swipeable renderRightActions={renderRightActions} hitSlop={{left: -10}}>
        <ListItem {...rest} />
      </Swipeable>
    );
  },
);

const styles = StyleSheet.create({
  deleteContainer: {
    backgroundColor: 'red',
    padding: 12,
    justifyContent: 'center',
  },
  deleteText: {
    color: 'white',
  },
});
