import { useEffect, useState } from 'react';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import useSpacebarHold from './hooks/useSpacebarHold';

let mediaRecorder: any;
const audioChunks: any[] = [];

function Hello() {
  const [recording, setRecording] = useState(false);
  const isHoldingSpace = useSpacebarHold();

  async function startRecording() {
    console.log('Starting Recording... ');
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const arrayBuffer = await audioBlob.arrayBuffer();

        // Send raw audio data to the main process
        window.electron.ipcRenderer.sendMessage(
          'save-audio',
          // new Uint8Array(arrayBuffer),
          arrayBuffer,
        );

        // Play the recorded audio
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      };

      mediaRecorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      console.log('Stopping Recording... ');
      mediaRecorder.stop();
      mediaRecorder = null;
      setRecording(false);
    }
  }

  useEffect(() => {
    if (isHoldingSpace) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isHoldingSpace]);

  return (
    <div>
      {!recording && (
        <button onClick={startRecording} type="button">
          Start Recording
        </button>
      )}
      {recording && (
        <button onClick={stopRecording} type="button">
          Stop Recording
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
