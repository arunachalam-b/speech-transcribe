import { useEffect, useState } from 'react';
import { LiveAudioVisualizer } from 'react-audio-visualize';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import useKeyPress from './hooks/useKeyPress';

let audioChunks: any[] = [];
const waveLineColor = 'rgba(255, 255, 255, 0.75)';

function Hello() {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [recording, setRecording] = useState(false);
  const enterPress = useKeyPress('Enter');

  const onFocus = () => {
    startRecording();
  };

  async function startRecording() {
    console.log('Starting Recording... ');
    audioChunks = [];
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorderLocal = new MediaRecorder(stream);

      mediaRecorderLocal.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorderLocal.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const arrayBuffer = await audioBlob.arrayBuffer();

        window.electron.ipcRenderer.sendMessage('save-audio', arrayBuffer);
      };

      mediaRecorderLocal.start();
      setMediaRecorder(mediaRecorderLocal);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      console.log('Stopping Recording... ');
      mediaRecorder.stop();
      // mediaRecorder = null;
      setMediaRecorder(undefined);
      setRecording(false);
    }
  }

  useEffect(() => {
    if (enterPress) {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterPress]);

  useEffect(() => {
    window.addEventListener('focus', onFocus);
    onFocus();
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: 20,
        alignItems: 'center',
      }}
    >
      {mediaRecorder ? (
        <LiveAudioVisualizer
          mediaRecorder={mediaRecorder}
          width={400}
          height={100}
          barColor={waveLineColor}
          gap={4}
        />
      ) : (
        <div
          style={{
            width: 400,
            height: 100,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ color: waveLineColor }}>
            
          </span>
        </div>
      )}
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
        <div>
          <p><i>Press <span><b>Enter</b></span> key to transcribe</i></p>
        </div>
      </div>
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
