import React, {useState} from 'react';
import {ListRenderItemInfo} from 'react-native';

import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {
  ItemSeparator,
  ListItem,
  SeedDataItem,
  TitleHighlight,
  useSeedData,
} from './common';

export const HeaderFooterScreen = () => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const renderItem = ({item}: ListRenderItemInfo<SeedDataItem>) => (
    <ListItem {...item} />
  );

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={ItemSeparator}
      ListHeaderComponent={<TitleHighlight title="Header" />}
      ListFooterComponent={<TitleHighlight title="Footer" />}
    />
  );
};
