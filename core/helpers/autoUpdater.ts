import {BrowserWindow, dialog} from 'electron';
import { autoUpdater } from 'electron-updater';
import logger from 'electron-log';

// Set file logger
logger.transports.file.level = "info";
autoUpdater.logger = logger;

// Disable auto downloading of updates
autoUpdater.autoDownload = false;

const updateApp = (mainWindow: BrowserWindow) => {
  // Check for update
  autoUpdater.checkForUpdates()
    .catch(e => logger.error('Check for updates failed', e));

  autoUpdater.on('update-available', () => {
    // prompt user to start download
    dialog.showMessageBox({
      type: 'info',
      title: 'Update available',
      message: 'A new version of Media Dashboard is available. Do you want to update now?',
      buttons: ['Update', 'No']
    }).then(res => {
      const buttonIndex = res.response;

      if (buttonIndex === 0) {
        autoUpdater.downloadUpdate()
          .catch(e => logger.error('Update download failed', e));
      }
    });

  });

  // Listen for update download finished
  autoUpdater.on('update-downloaded', () => {
    mainWindow.setProgressBar(-1);
    dialog.showMessageBox({
      type: 'info',
      title: 'Update ready',
      message: 'Update downloaded. Install update & restart now?',
      buttons: ['Yes', 'Later']
    }).then(res => {
      const buttonIndex = res.response;

      // install and restart
      if (buttonIndex === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  // Listen for download progress
  autoUpdater.on('download-progress', (progress, bytesPerSecond, percent) => {
    mainWindow.setProgressBar(progress);
  });
};

export default updateApp;
