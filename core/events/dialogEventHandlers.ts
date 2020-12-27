import {app, BrowserWindow, dialog, IpcMain, IpcMainInvokeEvent} from 'electron';
import {
  DialogEventData,
  DialogEventOpenReply,
  DialogEventSaveReply,
  DialogType, MessageBoxData, MessageBoxReply,
  SelectionType
} from "../../shared/models/dialogEventData";
import {DIALOG_EVENT_CHANNEL} from "../../shared/models/EventChannels";

let win: BrowserWindow = null;

const registerDialogEventHandlers = (ipcMain: IpcMain, window: BrowserWindow) => {
  ipcMain.handle(DIALOG_EVENT_CHANNEL, handleWindowEvents);
  win = window;
};

const handleWindowEvents = async (e: IpcMainInvokeEvent, dialogData: (DialogEventData | MessageBoxData)): Promise<(DialogEventOpenReply | DialogEventSaveReply | MessageBoxReply)> => {
  switch (dialogData.dialogType) {
    case DialogType.Open:
      const openResp = await dialogOpen(<DialogEventData>dialogData);
      return {canceled: openResp.canceled, filePaths: openResp.filePaths};
    case DialogType.Save:
      const saveResp = await dialogSave(<DialogEventData>dialogData);
      return {canceled: saveResp.canceled, filePath: saveResp.filePath};
    case DialogType.Error:
      dialogError(<DialogEventData>dialogData);
      break;
    case DialogType.Messagebox:
      return await createMessageBox(<MessageBoxData>dialogData);
    default:
      console.error('Dialog type not supported');
      return null;
  }
};

const createMessageBox = async (messageBoxData: MessageBoxData): Promise<MessageBoxReply> => {
  return await dialog.showMessageBox(win, {
    ...messageBoxData
  });
}

const dialogError = (dialogData: DialogEventData) => {
  dialog.showErrorBox(
    (dialogData.title ? dialogData.title : 'An Error Occurred'),
    (dialogData.content ? dialogData.content : 'Unknown')
  );
}

const dialogOpen = async (dialogData: DialogEventData) => {
  return await dialog.showOpenDialog(win, {
    buttonLabel: dialogData.buttonLabel,
    defaultPath: app.getPath('home'),
    filters: dialogData.filters,
    title: dialogData.title,
    properties: createProperties(dialogData)
  });
}

const dialogSave = async (dialogData: DialogEventData) => {
  return await dialog.showSaveDialog(win, {
    buttonLabel: dialogData.buttonLabel,
    defaultPath: app.getPath('home'),
    filters: dialogData.filters,
    title: dialogData.title,
    properties: createProperties(dialogData)
  });
}

const createProperties = (dialogData: DialogEventData) => {
  const properties = [];
  if (dialogData.allowMultiSelection)
    properties.push('multiSelections')

  switch (dialogData.selectionType) {
    case SelectionType.File:
      properties.push('openFile')
      break;
    case SelectionType.Directory:
      properties.push('openDirectory')
      break;
    default:
      properties.push('openDirectory')
      properties.push('openFile')
      break;
  }

  return properties;
}


export {registerDialogEventHandlers};
