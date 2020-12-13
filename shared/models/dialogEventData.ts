import {FileFilter} from 'electron';


export interface DialogEventData {
  dialogType: DialogType;
  selectionType: SelectionType;
  allowMultiSelection?: boolean;
  title?: string;
  buttonLabel?: string;
  filters?: FileFilter[];
}

export interface DialogEventOpenReply {
  canceled: boolean;
  filePaths?: string[];
}

export interface DialogEventSaveReply {
  canceled: boolean;
  filePath?: string;
}

export enum DialogType {
  Open,
  Save
}

export enum SelectionType {
  File,
  Directory
}
