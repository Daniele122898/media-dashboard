"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFileEventHandlers = void 0;
var EventChannels_1 = require("../../shared/models/EventChannels");
var fs = require("fs");
var md5File = require("md5-file");
var NodeCache = require("node-cache");
var win = null;
var cache = new NodeCache();
var registerFileEventHandlers = function (ipcMain, window) {
    win = window;
    ipcMain.handle(EventChannels_1.HASH_FILE_EVENT, handleHashFileEvent);
    ipcMain.handle(EventChannels_1.HASH_FILES_EVENT, handleHashFilesEvent);
};
exports.registerFileEventHandlers = registerFileEventHandlers;
var handleHashFileEvent = function (e, data) { return __awaiter(void 0, void 0, void 0, function () {
    var hash;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!fs.existsSync(data.path)) {
                    return [2 /*return*/, null];
                }
                hash = cache.get(data.path);
                if (!!hash) return [3 /*break*/, 2];
                return [4 /*yield*/, md5File(data.path)];
            case 1:
                hash = _a.sent();
                cache.set(data.path, hash, 3600);
                _a.label = 2;
            case 2: return [2 /*return*/, hash];
        }
    });
}); };
var handleHashFilesEvent = function (e, data) { return __awaiter(void 0, void 0, void 0, function () {
    var res, i, p, hash, promises, _loop_1, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                res = [];
                for (i = 0; i < data.paths.length; ++i) {
                    p = data.paths[i];
                    hash = cache.get(p);
                    if (!hash) {
                        hash = md5File(p);
                    }
                    res.push({ path: p, hash: hash });
                }
                promises = res.filter(function (p) { return p.hash instanceof Promise; });
                _loop_1 = function (i) {
                    var p, r, _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                p = promises[i];
                                r = res.find(function (x) { return x.path === p.path; });
                                _a = r;
                                return [4 /*yield*/, p.hash];
                            case 1:
                                _a.hash = _b.sent();
                                cache.set(r.path, r.hash);
                                return [2 /*return*/];
                        }
                    });
                };
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < promises.length)) return [3 /*break*/, 4];
                return [5 /*yield**/, _loop_1(i)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                ++i;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, res];
        }
    });
}); };
//# sourceMappingURL=fileEventHandlers.js.map