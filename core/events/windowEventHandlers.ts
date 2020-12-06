import {BrowserWindow, IpcMain} from 'electron';
import {WindowEvents} from "../../shared/models/windowEvents";

let win: BrowserWindow = null;

const registerWindowHandlers = (ipcMain: IpcMain, window: BrowserWindow) => {
  ipcMain.handle('window-events', handleWindowEvents);
  win = window;
}

const handleWindowEvents = (e, windowEvent: WindowEvents) => {
  switch (windowEvent) {
    case WindowEvents.maximize:
      win.maximize();
      break;
    case WindowEvents.unmaximize:
      win.unmaximize();
      break;
    case WindowEvents.minimize:
      win.minimize();
      break;
    case WindowEvents.close:
      win.close();
      break;
    case WindowEvents.isMaximized:
      return win.isMaximized();
    default:
      console.error('Missing switch case in window event handler');
  }
};

export {registerWindowHandlers};
