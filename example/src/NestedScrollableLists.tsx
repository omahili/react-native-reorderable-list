import React, {useState} from 'react';
import {ListRenderItemInfo, LogBox, StyleSheet} from 'react-native';

import {
  NestedReorderableList,
  ReorderableListReorderEvent,
  ScrollViewContainer,
  reorderItems,
} from 'react-native-reorderable-list';

import {ListItem, SeedDataItem, TitleHighlight, useSeedData} from './common';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews',
]);

interface NestedListProps {
  index: number;
}

const NestedList: React.FC<NestedListProps> = ({index}) => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);

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
      style={styles.nestedList}
      autoscrollThreshold={0.3} // increase scroll area
      autoscrollSpeedScale={0.5} // decrease scroll speed
      scrollable
      stickyHeaderIndices={[0]}
      ListHeaderComponent={<TitleHighlight title={`Nested List ${index}`} />}
    />
  );
};

export const NestedScrollableListsScreen = () => (
  <ScrollViewContainer style={styles.container}>
    <NestedList index={0} />
    <NestedList index={1} />
    <NestedList index={2} />
  </ScrollViewContainer>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nestedList: {
    height: 300,
  },
});
