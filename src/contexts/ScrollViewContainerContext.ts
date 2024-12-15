import React from 'react';
import {ScrollView} from 'react-native';

import {NativeGesture} from 'react-native-gesture-handler';
import {SharedValue} from 'react-native-reanimated';

interface ScrollViewContainerContextData {
  scrollViewContainerRef: React.RefObject<ScrollView>;
  scrollViewHeightY: SharedValue<number>;
  scrollViewScrollOffsetY: SharedValue<number>;
  scrollViewScrollEnabled: SharedValue<boolean>;
  outerScrollGesture: NativeGesture;
  initialScrollViewScrollEnabled: boolean;
}

export const ScrollViewContainerContext = React.createContext<
  ScrollViewContainerContextData | undefined
>(undefined);
