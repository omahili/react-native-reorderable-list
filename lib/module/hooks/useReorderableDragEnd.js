import { useEffect } from 'react';
import { useContext } from './useContext';
import { ReorderableCellContext, ReorderableListContext } from '../contexts';
export const useReorderableDragEnd = onEnd => {
  const {
    dragEndHandlers
  } = useContext(ReorderableListContext);
  const {
    index
  } = useContext(ReorderableCellContext);
  useEffect(() => {
    dragEndHandlers.modify(value => {
      'worklet';

      if (!Array.isArray(value[index])) {
        value[index] = [];
      }
      value[index].push(onEnd);
      return value;
    });
    return () => {
      dragEndHandlers.modify(value => {
        'worklet';

        if (Array.isArray(value[index])) {
          value[index] = value[index].filter(x => x.name !== onEnd.name);
        }
        return value;
      });
    };
  }, [index, dragEndHandlers, onEnd]);
};
//# sourceMappingURL=useReorderableDragEnd.js.map