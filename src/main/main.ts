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
import {
  app,
  BrowserWindow,
  clipboard,
  globalShortcut,
  ipcMain,
  shell,
} from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import fs from 'fs';
import path from 'path';
import Store from 'electron-store';

import type { Schema } from 'electron-store';

import MenuBuilder from './menu';
import { isFileExists, resolveHtmlPath } from './util';
import {
  APP_MODEL_PATH,
  APP_WHISPER_PATH,
  COMMUNICATION_CHANNELS,
  storageKeys,
} from '../constants';

import type { AppStoreType } from '../types';

const store = new Store<Schema<AppStoreType>>({
  [storageKeys.SELECTED_MODEL]: undefined,
  [storageKeys.SELECTED_MODEL_PATH]: undefined,
});

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const updateTranscriptingStatus = (status: boolean) => {
  mainWindow?.webContents.send(
    COMMUNICATION_CHANNELS.TRANSCRIPTION_STATUS,
    status,
  );
};

const transcribeAudio = async (filePath: string) => {
  console.log('Transcribing audio...');
  updateTranscriptingStatus(true);
  const modelPath = store.get(storageKeys.SELECTED_MODEL_PATH);

  const moveToRootFolder = isDebug ? '' : 'cd /opt/SpeechTranscribe &&';

  const transcribeCommand = `${moveToRootFolder} whisper/whisper-cli -m ${modelPath} -f ${filePath} -np -nt`;

  console.info('Transcribe command: ', transcribeCommand);

  const transcribedText = execSync(transcribeCommand).toString();

  updateTranscriptingStatus(false);

  const finalTranscribedText = transcribedText.trim();
  console.log('Transcribed Text: ', finalTranscribedText);

  setTimeout(() => {
    clipboard.writeText(finalTranscribedText);
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.close();
      }  
    }, 1000);
    if (mainWindow) {
      mainWindow.hide();
    }
  }, 100);
};

ipcMain.on(COMMUNICATION_CHANNELS.IPC_EXAMPLE, async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply(COMMUNICATION_CHANNELS.IPC_EXAMPLE, msgTemplate('pong'));
});

ipcMain.on(
  COMMUNICATION_CHANNELS.SAVE_AUDIO,
  (event, audioBuffer: ArrayBuffer) => {
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
        updateTranscriptingStatus(false);
      } else {
        console.log('Audio saved to', filePath);
        try {
          // if (mainWindow) {
          // mainWindow.webContents.send(COMMUNICATION_CHANNELS.TRANSCRIPTION_RESULT, `ffmpeg -i ${filePath} -ar 16000 ${outputPath}`);
          // }
          execSync(`ffmpeg -i ${filePath} -ar 16000 ${outputPath}`);
        } catch (error) {
          console.log('Error while converting audio', error);
        }

        transcribeAudio(outputPath);
      }
    });
  },
);

ipcMain.on(COMMUNICATION_CHANNELS.IS_MODEL_EXIST, (event, model) => {
  const modelPath = `${APP_MODEL_PATH}/ggml-${model}.bin`;

  const isModelExists = isFileExists(modelPath);

  event.reply(COMMUNICATION_CHANNELS.IS_MODEL_EXIST, isModelExists);

  if (isModelExists) {
    store.set(storageKeys.SELECTED_MODEL, model);
    store.set(storageKeys.SELECTED_MODEL_PATH, modelPath);
  }

  if (!isModelExists) {
    store.delete(storageKeys.SELECTED_MODEL);
    store.delete(storageKeys.SELECTED_MODEL_PATH);
  }
});

ipcMain.on(COMMUNICATION_CHANNELS.DONWLOAD_MODEL, (event, model) => {
  const isModelDirExists = isFileExists(APP_MODEL_PATH);

  if (!isModelDirExists) {
    execSync(`mkdir ${APP_MODEL_PATH}`);
  }

  const modelPath = `${APP_MODEL_PATH}/ggml-${model}.bin`;

  const isModelExists = isFileExists(modelPath);

  if (isModelExists) {
    event.reply(COMMUNICATION_CHANNELS.DONWLOAD_MODEL, 'Model already exists');
    store.set(storageKeys.SELECTED_MODEL, model);
    store.set(storageKeys.SELECTED_MODEL_PATH, modelPath);
    return;
  }

  let status;

  try {
    execSync(`cd ${APP_WHISPER_PATH} && ./download-ggml-model.sh ${model}`);
    status = true;
    store.set(storageKeys.SELECTED_MODEL, model);
    store.set(storageKeys.SELECTED_MODEL_PATH, modelPath);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Model download error: ', { err, model, modelPath });
    status = false;
  }

  event.reply(COMMUNICATION_CHANNELS.DONWLOAD_MODEL, status);
});

ipcMain.on(COMMUNICATION_CHANNELS.SELECTED_MODEL, (event) => {
  const model = store.get(storageKeys.SELECTED_MODEL);

  event.reply(COMMUNICATION_CHANNELS.SELECTED_MODEL, model);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

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

// app.on('will-quit', (event) => {
//     event.preventDefault();
// });

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
