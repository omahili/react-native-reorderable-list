import {useMemo} from 'react';

import {Gesture} from 'react-native-gesture-handler';

// It also allows navigating back through swipe with react navigation.
export const usePanGesture = () =>
  useMemo(() => Gesture.Pan().activateAfterLongPress(520), []);
