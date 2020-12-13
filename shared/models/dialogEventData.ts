import {FileFilter} from 'electron';


export interface DialogEventData {
  dialogType: DialogType;
  selectionType?: SelectionType;
  allowMultiSelection?: boolean;
  title?: string;
  content?: string;
  buttonLabel?: string;
  filters?: FileFilter[];
}

export interface MessageBoxData {
  dialogType: DialogType.Messagebox;
  type: "none" | "info" | "error" | "question" | "warning";
  message: string;
  buttons?: string[];
  defaultId?: number;
  title?: string;
}

export interface MessageBoxReply {
  response: number; // Index of pressed button
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
  Save,
  Error,
  Messagebox,
}

export enum SelectionType {
  File,
  Directory
}
