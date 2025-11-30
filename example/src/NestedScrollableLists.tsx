import React, {useState} from 'react';
import {ListRenderItemInfo, LogBox, StyleSheet, View} from 'react-native';

import {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {
  ListItem,
  NestedReorderableList,
  ScrollViewContainer,
  SeedDataItem,
  TitleHighlight,
  useHorizontal,
  usePanGesture,
  useSeedData,
} from './common';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews',
]);

interface NestedListProps {
  index: number;
}

const NestedList: React.FC<NestedListProps> = ({index}) => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);
  const panGesture = usePanGesture();
  const {horizontal} = useHorizontal();

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const renderItem = ({item}: ListRenderItemInfo<SeedDataItem>) => (
    <ListItem {...item} />
  );

  return (
    <NestedReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      style={
        horizontal ? styles.nestedListHorizontal : styles.nestedListVertical
      }
      // IMPORTANT: FlatList does not support this `stickyHeaderIndices`
      // in conjunction with `horizontal`, nor does ReorderableList.
      stickyHeaderIndices={[0]}
      ListHeaderComponent={<TitleHighlight title={`Nested List ${index}`} />}
      autoscrollThreshold={0.3} // increase autoscroll area
      autoscrollSpeedScale={0.5} // decrease autoscroll speed
      panGesture={panGesture}
      scrollable
    />
  );
};

export const NestedScrollableListsScreen = () => (
  <ScrollViewContainer style={styles.container}>
    <NestedList index={0} />
    {/* Test nested list in a nested view */}
    <View>
      <NestedList index={1} />
    </View>
    <NestedList index={2} />
  </ScrollViewContainer>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nestedListVertical: {
    height: 300,
  },
  nestedListHorizontal: {
    width: 300,
  },
});
