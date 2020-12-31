import {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import {GET_FILEID_EVENT, GET_FILEIDS_EVENT} from "../../shared/models/EventChannels";
import * as fs from 'fs';
import {BigIntOptions} from 'fs';
import {HashEventData, MultiHashEventData, MultiHashResponse} from "../../shared/models/fileEventData";
import * as NodeCache from "node-cache";

let win: BrowserWindow = null;

const cache = new NodeCache();

const registerFileEventHandlers = (ipcMain: IpcMain, window: BrowserWindow) => {
  win = window;
  ipcMain.handle(GET_FILEID_EVENT, handleHashFileEvent);
  ipcMain.handle(GET_FILEIDS_EVENT, handleHashFilesEvent);
};

const handleHashFileEvent = async (e: IpcMainInvokeEvent, data: HashEventData): Promise<string> => {
  if (!fs.existsSync(data.path)) {
    return null;
  }

  // TODO add option to use hash instead of nodeid
  // let hash: string = cache.get(data.path);
  // if (!hash){
  //   hash = await md5File(data.path);
  //   cache.set(data.path, hash, 3600);
  // }

  const stats = fs.statSync(data.path, <BigIntOptions>{
    bigint: true
  })

  return stats.ino.toString() + stats.dev.toString();
}

const handleHashFilesEvent = async (e: IpcMainInvokeEvent, data: MultiHashEventData): Promise<MultiHashResponse[]> => {
  const res = [];

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

  for (let i = 0; i<data.paths.length; ++i) {
    const p = data.paths[i];
    const stats = fs.statSync(p, <BigIntOptions>{
      bigint: true
    })

    const id = stats.ino.toString() + stats.dev.toString();
    res.push({path: p, fileId: id})
  }

  return res;
}

export {registerFileEventHandlers};
