import {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import {HASH_FILE_EVENT} from "../../shared/models/EventChannels";
import * as hasha from 'hasha';
import * as fs from 'fs';
import {HashEventData} from "../../shared/models/fileEventData";

let win: BrowserWindow = null;

const registerFileEventHandlers = (ipcMain: IpcMain, window: BrowserWindow) => {
  win = window;
  ipcMain.handle(HASH_FILE_EVENT, handleHashFileEvents);
};

const handleHashFileEvents = async (e: IpcMainInvokeEvent, data: HashEventData): Promise<any> => {
  if (!fs.existsSync(data.path)) {
    return null;
  }

  return await hasha.fromFile(data.path, {
    algorithm: 'md5'
  });
}

export {registerFileEventHandlers};
