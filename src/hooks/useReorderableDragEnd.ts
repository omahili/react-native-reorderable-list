import {useAnimatedReaction} from 'react-native-reanimated';

import {useContext} from './useContext';
import {ReorderableCellContext, ReorderableListContext} from '../contexts';

export const useReorderableDragEnd = (
  onEnd: (from: number, to: number) => void,
) => {
  const {currentIndex} = useContext(ReorderableListContext);
  const {releasedIndex, index} = useContext(ReorderableCellContext);

  useAnimatedReaction(
    () => releasedIndex.value === index,
    newValue => {
      if (newValue) {
        releasedIndex.value = -1;

        if (onEnd) {
          onEnd(index, currentIndex.value);
        }
      }
    },
    [onEnd],
  );
};
