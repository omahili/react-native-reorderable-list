import React, {useState} from 'react';
import {ListRenderItemInfo, StyleSheet, View} from 'react-native';

import {
  ReorderableListRenderItemInfo,
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {
  ItemSeparator,
  ListItem,
  ReorderableList,
  SeedDataItem,
  usePanGesture,
  useSeedData,
} from './common';

export const DropIndicatorScreen = () => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);
  const panGesture = usePanGesture();

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const renderItem = ({item}: ListRenderItemInfo<SeedDataItem>) => (
    <ListItem {...item} />
  );

  const renderDropIndicator = ({
    item,
  }: ReorderableListRenderItemInfo<SeedDataItem>) => (
    <View>
      <ListItem {...item} style={styles.dropIndicator} />
      <View style={styles.dropIndicatorBorder} />
    </View>
  );

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      renderDropIndicator={renderDropIndicator}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={ItemSeparator}
      panGesture={panGesture}
    />
  );
};

const styles = StyleSheet.create({
  dropIndicator: {
    opacity: 0.25,
  },
  dropIndicatorBorder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#0CAFFF',
  },
});
