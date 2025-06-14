import React, {Dispatch, SetStateAction} from 'react';
import {ScrollView} from 'react-native';

import {NativeGesture} from 'react-native-gesture-handler';
import {SharedValue} from 'react-native-reanimated';

interface ScrollViewContainerContextData {
  scrollViewContainerRef: React.RefObject<ScrollView>;
  scrollViewPageY: SharedValue<number>;
  scrollViewHeightY: SharedValue<number>;
  scrollViewScrollOffsetY: SharedValue<number>;
  scrollViewScrollEnabledProp: SharedValue<boolean>;
  outerScrollGesture: NativeGesture;
  setScrollViewForceDisableScroll: Dispatch<SetStateAction<boolean>>;
}

export const ScrollViewContainerContext = React.createContext<
  ScrollViewContainerContextData | undefined
>(undefined);
