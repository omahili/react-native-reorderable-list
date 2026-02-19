import { useAnimatedReaction } from 'react-native-reanimated';
import { useContext } from './useContext';
import { ReorderableCellContext } from '../contexts';
export const useReorderableDragStart = onStart => {
  const {
    draggedIndex,
    index
  } = useContext(ReorderableCellContext);
  useAnimatedReaction(() => draggedIndex.value === index, newValue => {
    if (newValue && onStart) {
      onStart(index);
    }
  }, [onStart]);
};
//# sourceMappingURL=useReorderableDragStart.js.map