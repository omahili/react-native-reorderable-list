import React, {useCallback, useMemo, useState} from 'react';
import {Button, ListRenderItemInfo, StyleSheet, View} from 'react-native';

import {Gesture} from 'react-native-gesture-handler';
import {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {
  ItemSeparator,
  ListItem,
  ReorderableList,
  SeedDataItem,
  useSeedData,
} from './common';

export const DragEnableScreen = () => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);
  const [dragEnabled, setDragEnabled] = useState(false);

  // Allows for navigation gestures.
  const panGesture = useMemo(
    () => Gesture.Pan().activeOffsetX([-20, 20]).activeOffsetY([0, 0]),
    [],
  );

  const handleReorder = useCallback(
    ({from, to}: ReorderableListReorderEvent) => {
      setData(value => reorderItems(value, from, to));
    },
    [],
  );

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<SeedDataItem>) => (
      <ListItem dragMode="press-in" {...item} />
    ),
    [],
  );

  const handleButtonPress = () => setDragEnabled(value => !value);

  return (
    <View style={styles.container}>
      <ReorderableList
        data={data}
        onReorder={handleReorder}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={ItemSeparator}
        panGesture={panGesture}
        dragEnabled={dragEnabled}
      />
      <Button
        title={dragEnabled ? 'Disable drag' : 'Enable drag'}
        onPress={handleButtonPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    flexGrow: 1,
  },
});
