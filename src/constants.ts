const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

enum COMMUNICATION_CHANNELS {
  TRANSCRIPTION_STATUS = 'transcription-status',
  SAVE_AUDIO = 'save-audio',
  IPC_EXAMPLE = 'ipc-example',
  TRANSCRIPTION_RESULT = 'transcription-result',
  UPDATE_RENDERER_ROUTE = 'update-renderer-route',
  IS_MODEL_EXIST = 'is-model-exist',
  DONWLOAD_MODEL = 'download-model',
  SELECTED_MODEL = 'selected-model',
  MODEL_DOWNLOAD_STATUS = 'model-download-status'
}

enum RENDERER_ROUTE_ACTION {
  PUSH = 'push',
  POP = 'pop',
  BACK = 'back',
}

enum RENDERER_ROUTE {
  ROOT = '/',
  SETTINGS = '/settings',
}

const storageKeys = {
  SELECTED_MODEL: 'SELECTED_MODEL',
  SELECTED_MODEL_PATH: 'SELECTED_MODEL_PATH',
};

const APP_ROOT_PATH = isDebug ? '' : '/opt/SpeechTranscribe';
const APP_WHISPER_PATH = isDebug ? 'whisper' : `${APP_ROOT_PATH}/whisper`;
const APP_MODEL_PATH = `${APP_WHISPER_PATH}`;

const AVAILABLE_MODELS: Array<string> = [
  'tiny',
  'tiny.en',
  'tiny-q5_1',
  'tiny.en-q5_1',
  'tiny-q8_0',
  'base',
  'base.en',
  'base-q5_1',
  'base.en-q5_1',
  'base-q8_0',
  'small',
  'small.en',
  'small.en-tdrz',
  'small-q5_1',
  'small.en-q5_1',
  'small-q8_0',
  'medium',
  'medium.en',
  'medium-q5_0',
  'medium.en-q5_0',
  'medium-q8_0',
  'large-v1',
  'large-v2',
  'large-v2-q5_0',
  'large-v2-q8_0',
  'large-v3',
  'large-v3-q5_0',
  'large-v3-turbo',
  'large-v3-turbo-q5_0',
  'large-v3-turbo-q8_0',
];

export {
  COMMUNICATION_CHANNELS,
  RENDERER_ROUTE_ACTION,
  RENDERER_ROUTE,
  APP_ROOT_PATH,
  APP_MODEL_PATH,
  APP_WHISPER_PATH,
  storageKeys,
  AVAILABLE_MODELS,
};
