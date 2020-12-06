import {app, BrowserWindow, screen, Menu, Tray, ipcMain} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as windowStateKeeper from 'electron-window-state';
import {WindowEvents} from "./shared/models/windowEvents";
import {registerWindowHandlers} from "./core/events/windowEventHandlers";

let win: BrowserWindow = null;
let tray: Tray = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

const mainMenu = Menu.buildFromTemplate([
  {
    label: 'Media Dashboard'
  }
]);

const trayMenu = Menu.buildFromTemplate([
  {
    label: 'Quit Media Dashboard',
    role: "quit"
  }
]);

function createTray(): Tray {
  tray = new Tray('trayTemplate@2x.png');
  tray.setToolTip('Media Dashboard');

  tray.on('click', e => {
    win.show();
  });

  tray.on('right-click', e => {
    trayMenu.popup();
  });

  return tray;
}

function createWindow(): BrowserWindow {

  createTray();

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create window state manager
  const winState = windowStateKeeper({
    defaultWidth: size.width / 2,
    defaultHeight: size.height / 2
  });

  // Create the browser window.
  win = new BrowserWindow({
    x: winState.x,
    y: winState.y,
    width: winState.width,
    height: winState.height,
    minHeight: 300,
    minWidth: 500,
    backgroundColor: '#202225',
    frame: false,
    resizable: true,
    closable: true,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run 2e2 test with Spectron
      enableRemoteModule: false // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    },
  });

  // can only see this menue on mac or linux. Since frame is turned off u cant see it on windows.
  Menu.setApplicationMenu(mainMenu);

  if (serve) {

    win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');

  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  ipcMain.on('channel1', (e, args)=> {
    console.log(args);
    // e.sender.send('channel1', response)
  });

  registerWindowHandlers(ipcMain, win);

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  // win.on('close', (e) => {
  //   app.quit();
  // });

  winState.manage(win);

  const wc = win.webContents;
  wc.on('new-window', (e, url) => {
    e.preventDefault();
    console.log('Prevented creation of new window for ', url);
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    setTimeout(createWindow, 400);

    // Use this path to store any data associated with app
    // setTimeout(() => {
    //   console.log('USER APP DATA PATH:', app.getPath('userData'));
    // }, 5000);
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
