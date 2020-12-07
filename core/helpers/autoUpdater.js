"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var electron_updater_1 = require("electron-updater");
var electron_log_1 = require("electron-log");
// Set file logger
electron_log_1.default.transports.file.level = "info";
electron_updater_1.autoUpdater.logger = electron_log_1.default;
// Disable auto downloading of updates
electron_updater_1.autoUpdater.autoDownload = false;
var updateApp = function (mainWindow) {
    // Check for update
    electron_updater_1.autoUpdater.checkForUpdates();
    electron_updater_1.autoUpdater.on('update-available', function () {
        // prompt user to start download
        electron_1.dialog.showMessageBox({
            type: 'info',
            title: 'Update available',
            message: 'A new version of Media Dashboard is available. Do you want to update now?',
            buttons: ['Update', 'No']
        }).then(function (res) {
            var buttonIndex = res.response;
            if (buttonIndex === 0) {
                electron_updater_1.autoUpdater.downloadUpdate();
            }
        });
    });
    // Listen for update download finished
    electron_updater_1.autoUpdater.on('update-downloaded', function () {
        mainWindow.setProgressBar(-1);
        electron_1.dialog.showMessageBox({
            type: 'info',
            title: 'Update ready',
            message: 'Update downloaded. Install update & restart now?',
            buttons: ['Yes', 'Later']
        }).then(function (res) {
            var buttonIndex = res.response;
            // install and restart
            if (buttonIndex === 0) {
                electron_updater_1.autoUpdater.quitAndInstall(false, true);
            }
        });
    });
    // Listen for download progress
    electron_updater_1.autoUpdater.on('download-progress', function (progress, bytesPerSecond, percent) {
        mainWindow.setProgressBar(progress);
    });
};
exports.default = updateApp;
//# sourceMappingURL=autoUpdater.js.map