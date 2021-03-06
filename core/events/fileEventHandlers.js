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
var NodeCache = require("node-cache");
var win = null;
var cache = new NodeCache();
var registerFileEventHandlers = function (ipcMain, window) {
    win = window;
    ipcMain.handle(EventChannels_1.GET_FILEID_EVENT, handleHashFileEvent);
    ipcMain.handle(EventChannels_1.GET_FILEIDS_EVENT, handleHashFilesEvent);
};
exports.registerFileEventHandlers = registerFileEventHandlers;
var handleHashFileEvent = function (e, data) { return __awaiter(void 0, void 0, void 0, function () {
    var stats;
    return __generator(this, function (_a) {
        if (!fs.existsSync(data.path)) {
            return [2 /*return*/, null];
        }
        stats = fs.statSync(data.path, {
            bigint: true
        });
        return [2 /*return*/, stats.ino.toString() + stats.dev.toString()];
    });
}); };
var handleHashFilesEvent = function (e, data) { return __awaiter(void 0, void 0, void 0, function () {
    var res, i, p, stats, id;
    return __generator(this, function (_a) {
        res = [];
        // TODO add option to choose hash or fileId!
        // for (let i = 0; i<data.paths.length; ++i) {
        //   const p = data.paths[i];
        //   let hash = cache.get(p);
        //   if (!hash) {
        //     hash = md5File(p);
        //   }
        //   res.push({path: p, hash});
        // }
        //
        // const promises = res.filter(p => p.hash instanceof Promise);
        // for (let i = 0; i<promises.length; ++i) {
        //   const p = promises[i];
        //   let r = res.find(x => x.path === p.path);
        //   r.hash = await p.hash;
        //   cache.set(r.path, r.hash);
        // }
        for (i = 0; i < data.paths.length; ++i) {
            p = data.paths[i];
            stats = fs.statSync(p, {
                bigint: true
            });
            id = stats.ino.toString() + stats.dev.toString();
            res.push({ path: p, fileId: id });
        }
        return [2 /*return*/, res];
    });
}); };
//# sourceMappingURL=fileEventHandlers.js.map