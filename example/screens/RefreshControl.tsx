import React, {useCallback, useState} from 'react';
import {
  ListRenderItemInfo,
  Platform,
  RefreshControl,
  StyleSheet,
} from 'react-native';

import {runOnJS} from 'react-native-reanimated';
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {PlaylistItemData} from './Playlist';
import playlistData from './Playlist/data.json';
import {PlaylistItem} from './Playlist/PlaylistItem';
import {PlaylistItemSeparator} from './Playlist/PlaylistItemSeparator';

export const RefreshControlScreen = () => {
  const [data, setData] = useState(playlistData);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshEnabled, setRefreshEnabled] = useState(true);

  const handleReorder = useCallback(
    ({from, to}: ReorderableListReorderEvent) => {
      setData(value => reorderItems(value, from, to));
    },
    [],
  );

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<PlaylistItemData>) => (
      <PlaylistItem {...item} />
    ),
    [],
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 5000);
  };

  const handleDragStart = useCallback(() => {
    'worklet';

    // NOTE: if it's refreshing we don't want the refresh control to disappear
    // and we can keep it enabled since it won't conflict with the drag
    if (Platform.OS === 'android' && !refreshing) {
      runOnJS(setRefreshEnabled)(false);
    }
  }, [refreshing]);

  const handleDragEnd = useCallback(() => {
    'worklet';

    // NOTE: if it's refreshing we don't want the refresh control to disappear
    // and we can keep it enabled since it won't conflict with the drag
    if (Platform.OS === 'android' && !refreshing) {
      runOnJS(setRefreshEnabled)(true);
    }
  }, [refreshing]);

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={PlaylistItemSeparator}
      style={styles.list}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          enabled={refreshEnabled}
        />
      }
      panActivateAfterLongPress={Platform.OS === 'android' ? 520 : undefined}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: 'white',
  },
});
