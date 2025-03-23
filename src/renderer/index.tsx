import { createRoot } from 'react-dom/client';

import App from './App';
import { COMMUNICATION_CHANNELS } from '../constants';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once(COMMUNICATION_CHANNELS.IPC_EXAMPLE, (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage(COMMUNICATION_CHANNELS.IPC_EXAMPLE, [
  'ping',
]);
