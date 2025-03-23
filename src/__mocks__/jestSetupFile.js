import { TextEncoder } from 'node:util';

global.TextEncoder = TextEncoder;

const mockMediaStreamObject = {
  getVideoTracks() {
    return [];
  },
  getAudioTracks() {
    return [];
  },
};

Object.defineProperty(global.navigator, 'mediaDevices', {
  configurable: true,
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValueOnce(mockMediaStreamObject),
  },
});

Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    ondataavailable: jest.fn(),
    onerror: jest.fn(),
    state: '',
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  })),
});

Object.defineProperty(MediaRecorder, 'isTypeSupported', {
  writable: true,
  value: () => true,
});

const mockElectron = {
  ipcRenderer: {
    sendMessage: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    removeEventListener: jest.fn(),
  },
};

global.window.electron = mockElectron;
