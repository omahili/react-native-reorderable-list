import React, {memo} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

import {useReorderableDrag} from 'react-native-reorderable-list';

export interface ListItemProps {
  image: string;
  title: string;
  description: string;
  dragMode?: 'press-in' | 'long-press';
}

export const ListItem: React.FC<ListItemProps> = memo(
  ({image, title, description, dragMode = 'long-press'}) => {
    const drag = useReorderableDrag();

    return (
      <Pressable
        style={styles.container}
        onPressIn={dragMode === 'press-in' ? drag : undefined}
        onLongPress={dragMode === 'long-press' ? drag : undefined}>
        <Image
          style={styles.image}
          source={{
            uri: image,
          }}
        />
        <View style={styles.details}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 4,
    marginTop: 4,
  },
  details: {
    flex: 1,
    gap: 4,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    color: 'black',
  },
  description: {
    fontSize: 14,
    color: '#707070',
  },
});
