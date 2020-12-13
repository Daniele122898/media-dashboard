import {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import {WindowEvents} from "../../shared/models/windowEvents";
import {WINDOW_EVENT_CHANNEL} from "../../shared/models/EventChannels";

let win: BrowserWindow = null;

const registerWindowHandlers = (ipcMain: IpcMain, window: BrowserWindow) => {
  ipcMain.handle(WINDOW_EVENT_CHANNEL, handleWindowEvents);
  win = window;
};

const handleWindowEvents = (e: IpcMainInvokeEvent, windowEvent: WindowEvents) => {
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
