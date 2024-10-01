import React, {useState} from 'react';
import {ListRenderItemInfo, StyleSheet} from 'react-native';

import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import playlistData from './data.json';
import {PlaylistItem} from './PlaylistItem';
import {PlaylistItemSeparator} from './PlaylistItemSeparator';

export const PlaylistScreen = () => {
  const [data, setData] = useState(playlistData);

  const renderItem = ({item}: ListRenderItemInfo<any>) => (
    <PlaylistItem {...item} />
  );

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    const newData = reorderItems(data, from, to);
    setData(newData);
  };

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      style={styles.list}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={PlaylistItemSeparator}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: 'white',
  },
});
