"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionType = exports.DialogType = void 0;
var DialogType;
(function (DialogType) {
    DialogType[DialogType["Open"] = 0] = "Open";
    DialogType[DialogType["Save"] = 1] = "Save";
    DialogType[DialogType["Error"] = 2] = "Error";
    DialogType[DialogType["Messagebox"] = 3] = "Messagebox";
})(DialogType = exports.DialogType || (exports.DialogType = {}));
var SelectionType;
(function (SelectionType) {
    SelectionType[SelectionType["File"] = 0] = "File";
    SelectionType[SelectionType["Directory"] = 1] = "Directory";
})(SelectionType = exports.SelectionType || (exports.SelectionType = {}));
//# sourceMappingURL=dialogEventData.js.map