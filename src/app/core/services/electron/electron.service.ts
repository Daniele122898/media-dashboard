import { Injectable } from '@angular/core';
import {from} from 'rxjs';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, shell } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as fileType from 'file-type';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  public ipcRenderer: typeof ipcRenderer;
  public webFrame: typeof webFrame;
  public childProcess: typeof childProcess;
  public fs: typeof fs;
  public path: typeof path;
  public fileType: typeof fileType;
  public shell: typeof shell;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.shell = window.require('electron').shell;

      // If you wan to use remote object, pleanse set enableRemoteModule to true in main.ts
      // this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.path = window.require('path');
      this.fileType = window.require('file-type');
    }
  }

  public openFileLocation(path: string): void {
    this.shell.openPath(path)
      .catch(err => console.error(err));
  }

  public invokeHandler<T, R = any>(handler: string, payload: R): Observable<T> {
    return from(this.ipcRenderer.invoke(handler, payload));
  }

  public sendIpcMessage(channel: string, payload: any): void {
    this.ipcRenderer.send(channel, payload);
  }
}
