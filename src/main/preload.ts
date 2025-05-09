// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

import { COMMUNICATION_CHANNELS } from '../constants';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: COMMUNICATION_CHANNELS, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: COMMUNICATION_CHANNELS, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: COMMUNICATION_CHANNELS, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    addListener(
      channel: COMMUNICATION_CHANNELS,
      func: (...args: unknown[]) => void,
    ) {
      ipcRenderer.addListener(channel, (_event, ...args) => func(...args));
    },
    removeAllListeners(channel: COMMUNICATION_CHANNELS) {
      ipcRenderer.removeAllListeners(channel);
    },
    removeListener(
      channel: COMMUNICATION_CHANNELS,
      func: (...args: unknown[]) => void,
    ) {
      ipcRenderer.removeListener(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
