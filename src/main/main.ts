/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { execSync } from 'child_process';
import clipboard from 'clipboardy';
import { app, BrowserWindow, globalShortcut, ipcMain, shell } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import fs from 'fs';
import path from 'path';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const transcribeAudio = async (filePath: string) => {
  console.log('Transcribing audio...');
  const transcribedText = execSync(
    `whisper.cpp/build/bin/whisper-cli -m whisper.cpp/models/ggml-base.en.bin -f ${filePath} -np -nt`,
  ).toString();
  console.log('Transcribed Text', transcribedText);
  setTimeout(() => {
    clipboard.writeSync(transcribedText.trim());
    try {
      execSync('pbpaste');
    } catch (error) {
      const pasteCommand = process.platform === 'darwin' ? 'Cmd+V' : 'Ctrl+V';
      execSync(`xdotool key ${pasteCommand}`);
    }
  }, 100);
  if (mainWindow) {
    mainWindow.hide();
  }
};

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('save-audio', (event, audioBuffer: ArrayBuffer) => {
  // const tempPath = execSync('pwd').toString().trim();
  const tempPath = app.getPath('home');

  const filePath = path.join(tempPath, 'audio_in.wav');
  const outputPath = path.join(tempPath, 'audio_out.wav');

  try {
    execSync(`rm ${filePath} ${outputPath}`);
  } catch (error) {
    console.log('Error while deleting files', error);
  }

  fs.writeFile(filePath, Buffer.from(audioBuffer), async (err) => {
    if (err) {
      console.error('Failed to save audio:', err);
    } else {
      console.log('Audio saved to', filePath);
      try {
        execSync(`ffmpeg -i ${filePath} -ar 16000 ${outputPath}`);
      } catch (error) {
        console.log('Error while converting audio', error);
      }
      transcribeAudio(outputPath);
    }
  });
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  globalShortcut.register('Alt+Shift+X', async () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', (event) => {
    event.preventDefault();
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
