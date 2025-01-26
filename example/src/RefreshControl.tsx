import React, {useCallback, useState} from 'react';
import {ListRenderItemInfo, Platform, RefreshControl} from 'react-native';

import {runOnJS} from 'react-native-reanimated';
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {ItemSeparator, ListItem, SeedDataItem, useSeedData} from './common';

export const RefreshControlScreen = () => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshEnabled, setRefreshEnabled] = useState(true);

  const handleReorder = useCallback(
    ({from, to}: ReorderableListReorderEvent) => {
      setData(value => reorderItems(value, from, to));
    },
    [],
  );

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<SeedDataItem>) => <ListItem {...item} />,
    [],
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 5000);
  };

  const handleDragStart = useCallback(() => {
    'worklet';

    // NOTE: If it's refreshing we don't want the refresh control to disappear
    // and we can keep it enabled since it won't conflict with the drag.
    if (Platform.OS === 'android' && !refreshing) {
      runOnJS(setRefreshEnabled)(false);
    }
  }, [refreshing]);

  const handleDragEnd = useCallback(() => {
    'worklet';

    if (Platform.OS === 'android') {
      runOnJS(setRefreshEnabled)(true);
    }
  }, []);

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={ItemSeparator}
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
