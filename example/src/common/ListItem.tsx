import React, {memo} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewProps,
} from 'react-native';

import {useReorderableDrag} from 'react-native-reorderable-list';

import {useHorizontal} from '../common';

export interface ListItemProps extends ViewProps {
  image: string;
  imageWidth: number;
  title: string;
  description: string;
  dragMode?: 'press-in' | 'long-press';
}

export const ListItem: React.FC<ListItemProps> = memo(
  ({image, imageWidth, title, description, dragMode = 'long-press', style}) => {
    const drag = useReorderableDrag();
    const {horizontal} = useHorizontal();

    return (
      <Pressable
        style={[styles.container, style]}
        onPressIn={dragMode === 'press-in' ? drag : undefined}
        onLongPress={dragMode === 'long-press' ? drag : undefined}>
        {/* When list is horizontal display images with variable width. */}
        <Image
          style={[styles.image, horizontal && {width: imageWidth}]}
          source={{
            uri: image,
          }}
        />

        {/* When list is horizontal hide text. */}
        {!horizontal && (
          <View style={styles.details}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        )}
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
