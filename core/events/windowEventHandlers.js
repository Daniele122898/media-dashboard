"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWindowHandlers = void 0;
var windowEvents_1 = require("../../shared/models/windowEvents");
var EventChannels_1 = require("../../shared/models/EventChannels");
var win = null;
var registerWindowHandlers = function (ipcMain, window) {
    ipcMain.handle(EventChannels_1.WINDOW_EVENT_CHANNEL, handleWindowEvents);
    win = window;
};
exports.registerWindowHandlers = registerWindowHandlers;
var handleWindowEvents = function (e, windowEvent) {
    switch (windowEvent) {
        case windowEvents_1.WindowEvents.maximize:
            win.maximize();
            break;
        case windowEvents_1.WindowEvents.unmaximize:
            win.unmaximize();
            break;
        case windowEvents_1.WindowEvents.minimize:
            win.minimize();
            break;
        case windowEvents_1.WindowEvents.close:
            win.close();
            break;
        case windowEvents_1.WindowEvents.isMaximized:
            return win.isMaximized();
        default:
            console.error('Missing switch case in window event handler');
    }
};
//# sourceMappingURL=windowEventHandlers.js.map