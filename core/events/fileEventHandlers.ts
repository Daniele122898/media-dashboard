import {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import {HASH_FILE_EVENT, HASH_FILES_EVENT} from "../../shared/models/EventChannels";
import * as fs from 'fs';
import * as md5File from 'md5-file';
import {HashEventData, MultiHashEventData, MultiHashResponse} from "../../shared/models/fileEventData";
import * as NodeCache from "node-cache";

let win: BrowserWindow = null;

const cache = new NodeCache();

const registerFileEventHandlers = (ipcMain: IpcMain, window: BrowserWindow) => {
  win = window;
  ipcMain.handle(HASH_FILE_EVENT, handleHashFileEvent);
  ipcMain.handle(HASH_FILES_EVENT, handleHashFilesEvent);
};

const handleHashFileEvent = async (e: IpcMainInvokeEvent, data: HashEventData): Promise<string> => {
  if (!fs.existsSync(data.path)) {
    return null;
  }

  let hash: string = cache.get(data.path);
  if (!hash){
    hash = await md5File(data.path);
    cache.set(data.path, hash, 3600);
  }

  return hash;
}

const handleHashFilesEvent = async (e: IpcMainInvokeEvent, data: MultiHashEventData): Promise<MultiHashResponse[]> => {
  const res = [];
  for (let i = 0; i<data.paths.length; ++i) {
    const p = data.paths[i];
    let hash = cache.get(p);
    if (!hash) {
      hash = md5File(p);
    }
    res.push({path: p, hash});
  }

  const promises = res.filter(p => p.hash instanceof Promise);
  for (let i = 0; i<promises.length; ++i) {
    const p = promises[i];
    let r = res.find(x => x.path === p.path);
    r.hash = await p.hash;
    cache.set(r.path, r.hash);
  }

  return res;
}

export {registerFileEventHandlers};
