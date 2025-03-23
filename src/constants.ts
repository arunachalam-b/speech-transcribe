enum COMMUNICATION_CHANNELS {
  TRANSCRIPTION_STATUS = 'transcription-status',
  SAVE_AUDIO = 'save-audio',
  IPC_EXAMPLE = 'ipc-example',
  TRANSCRIPTION_RESULT = 'transcription-result',
  UPDATE_RENDERER_ROUTE = 'update-renderer-route',
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

export { COMMUNICATION_CHANNELS, RENDERER_ROUTE_ACTION, RENDERER_ROUTE };
