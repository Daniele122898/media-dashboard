import {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import {HASH_FILE_EVENT, HASH_FILES_EVENT} from "../../shared/models/EventChannels";
import * as hasha from 'hasha';
import * as fs from 'fs';
import {HashEventData, MultiHashEventData, MultiHashResponse} from "../../shared/models/fileEventData";

let win: BrowserWindow = null;

const registerFileEventHandlers = (ipcMain: IpcMain, window: BrowserWindow) => {
  win = window;
  ipcMain.handle(HASH_FILE_EVENT, handleHashFileEvent);
  ipcMain.handle(HASH_FILES_EVENT, handleHashFilesEvent);
};

const handleHashFileEvent = async (e: IpcMainInvokeEvent, data: HashEventData): Promise<string> => {
  if (!fs.existsSync(data.path)) {
    return null;
  }

  return await hasha.fromFile(data.path, {
    algorithm: 'md5'
  });
}

const handleHashFilesEvent = async (e: IpcMainInvokeEvent, data: MultiHashEventData): Promise<MultiHashResponse[]> => {
  console.log('RECEIVED ALL HASHES');
  const promises = [];


  data.paths.forEach(path => {
    console.log('RECEIVED PATH:', path)
    promises.push(hasha.fromFile(path, {
      algorithm: 'md5'
    }));
  });
  console.log('FINISHED LOOP');

  // const results = [];
  // for (let i = 0; i<promises.length; ++i) {
  //   const r = await promises[i];
  //   console.log(data.paths[i], ' got HASH: ', r);
  //   results.push(r);
  // }

  const results = await Promise.all(promises);
  console.log('FINISHED PROMISES');
  return results.map((r, i) => ({path: data.paths[i], hash: r}))
}

export {registerFileEventHandlers};
