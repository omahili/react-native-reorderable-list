"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _props = require("./props");
Object.keys(_props).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _props[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _props[key];
    }
  });
});
var _misc = require("./misc");
Object.keys(_misc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _misc[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _misc[key];
    }
  });
});
//# sourceMappingURL=index.js.map