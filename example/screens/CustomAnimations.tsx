import React, {useState} from 'react';
import {ListRenderItemInfo, StyleSheet} from 'react-native';

import {Easing, useSharedValue, withTiming} from 'react-native-reanimated';
import ReorderableList, {
  ReorderableListDragEndEvent,
  ReorderableListDragStartEvent,
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {PlaylistItemData} from './Playlist';
import playlistData from './Playlist/data.json';
import {PlaylistItem} from './Playlist/PlaylistItem';
import {PlaylistItemSeparator} from './Playlist/PlaylistItemSeparator';

export const CustomAnimationsScreen = () => {
  const [data, setData] = useState(playlistData);
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0);

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const handleDragStart = (_: ReorderableListDragStartEvent) => {
    'worklet';

    scale.value = withTiming(1.05, {
      easing: Easing.in(Easing.elastic(5)),
      duration: 150,
    });

    shadowOpacity.value = withTiming(1, {
      easing: Easing.in(Easing.elastic(5)),
      duration: 150,
    });
  };

  const handleDragEnd = (_: ReorderableListDragEndEvent) => {
    'worklet';

    scale.value = withTiming(1, {
      easing: Easing.in(Easing.elastic(3)),
      duration: 200,
    });

    shadowOpacity.value = withTiming(0, {
      easing: Easing.in(Easing.elastic(3)),
      duration: 200,
    });
  };

  const renderItem = ({item}: ListRenderItemInfo<PlaylistItemData>) => (
    <PlaylistItem {...item} />
  );

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={PlaylistItemSeparator}
      cellAnimations={{
        scale,
        opacity: false,
        shadow: {
          opacity: shadowOpacity,
        },
      }}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: 'white',
  },
});
