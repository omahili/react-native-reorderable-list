import React, {memo, useState} from 'react';
import {ListRenderItemInfo} from 'react-native';

import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
  useIsActive,
} from 'react-native-reorderable-list';

import {ItemSeparator, ListItem, ListItemProps, useSeedData} from './common';

export const ActiveItem: React.FC<ListItemProps> = memo(props => {
  const isActive = useIsActive();

  return (
    <ListItem
      {...props}
      description={isActive ? 'ACTIVE' : props.description}
    />
  );
});

export const ActiveItemScreen = () => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const renderItem = ({item}: ListRenderItemInfo<ListItemProps>) => (
    <ActiveItem {...item} />
  );

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={ItemSeparator}
      shouldUpdateActiveItem
    />
  );
};
