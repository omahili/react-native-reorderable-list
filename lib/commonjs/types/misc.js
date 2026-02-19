"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReorderableListState = void 0;
let ReorderableListState = exports.ReorderableListState = /*#__PURE__*/function (ReorderableListState) {
  ReorderableListState[ReorderableListState["IDLE"] = 0] = "IDLE";
  ReorderableListState[ReorderableListState["DRAGGED"] = 1] = "DRAGGED";
  ReorderableListState[ReorderableListState["RELEASED"] = 2] = "RELEASED";
  ReorderableListState[ReorderableListState["AUTOSCROLL"] = 3] = "AUTOSCROLL";
  return ReorderableListState;
}({});
//# sourceMappingURL=misc.js.map