import React, {useCallback, useState} from 'react';
import {ListRenderItemInfo, StyleSheet, View} from 'react-native';

import {runOnJS} from 'react-native-reanimated';
import {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';
import {ReorderableListIndexChangeEvent} from 'src/types';

import {
  ItemSeparator,
  ListItem,
  ReorderableList,
  SeedDataItem,
  TitleHighlight,
  usePanGesture,
  useSeedData,
} from './common';

export const IndexChangeScreen = () => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);
  const [currentIndex, setCurrentIndex] = useState<number>();
  const panGesture = usePanGesture();

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const renderItem = ({item}: ListRenderItemInfo<SeedDataItem>) => (
    <ListItem {...item} />
  );

  const handleDragEnd = useCallback(() => {
    'worklet';

    runOnJS(setCurrentIndex)(undefined);
  }, []);

  const handleIndexChange = useCallback(
    (e: ReorderableListIndexChangeEvent) => {
      'worklet';

      runOnJS(setCurrentIndex)(e.index);
    },
    [],
  );

  return (
    <View style={styles.container}>
      <ReorderableList
        data={data}
        onReorder={handleReorder}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={ItemSeparator}
        onDragEnd={handleDragEnd}
        onDragStart={handleIndexChange} // to register index at start
        onIndexChange={handleIndexChange}
        panGesture={panGesture}
      />
      <TitleHighlight
        title={`Current ${
          currentIndex !== undefined ? currentIndex : 'unknown'
        }`}
        style={styles.footer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    height: 60,
  },
});
