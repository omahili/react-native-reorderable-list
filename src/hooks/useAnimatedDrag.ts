import {DependencyList, useEffect} from 'react';

import {useAnimatedReaction} from 'react-native-reanimated';

import ReorderableCellContext from '../contexts/ReorderableCellContext';
import ReorderableListContext from '../contexts/ReorderableListContext';
import useLibraryContext from '../hooks/useLibraryContext';

interface UseAnimatedDragHandlers {
  onStart?: () => void;
  onRelease?: () => void;
  onEnd?: () => void;
}

const useAnimatedDrag = (
  {onStart, onRelease, onEnd}: UseAnimatedDragHandlers,
  deps?: DependencyList,
) => {
  const {currentIndex} = useLibraryContext(ReorderableListContext);
  const {dragged, released, index} = useLibraryContext(ReorderableCellContext);

  useAnimatedReaction(
    () => dragged.value,
    newValue => {
      if (newValue && onStart) {
        onStart();
      }
    },
    deps,
  );

  useAnimatedReaction(
    () => released.value,
    newValue => {
      if (newValue) {
        released.value = false;

        if (onRelease) {
          onRelease();
        }
      }
    },
    deps,
  );

  useEffect(() => {
    if (currentIndex.value === index && onEnd) {
      onEnd();
    }
  }, [currentIndex, index, onEnd]);
};

export default useAnimatedDrag;
