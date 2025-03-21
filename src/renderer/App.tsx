import { useEffect, useState } from 'react';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { LiveAudioVisualizer } from 'react-audio-visualize';

import './App.css';
import useSpacebarHold from './hooks/useSpacebarHold';

// let mediaRecorder: any;
let audioChunks: any[] = [];
const waveLineColor = 'rgba(255, 255, 255, 0.75)';

function Hello() {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();

  const [recording, setRecording] = useState(false);
  // const [transcribedText, setTranscribedText] = useState('');
  const isHoldingSpace = useSpacebarHold();

  // useEffect(() => {
  //   const handleTranscriptionResult = (text: any) => {
  //     setTranscribedText(text);
  //   };

  //   window.electron.ipcRenderer.on('transcription-result', handleTranscriptionResult);

  //   return () => {
  //     window.electron.ipcRenderer.removeListener('transcription-result', handleTranscriptionResult);
  //   };
  // }, []);

  async function startRecording() {
    console.log('Starting Recording... ');
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorderLocal = new MediaRecorder(stream);

      setMediaRecorder(mediaRecorderLocal);

      mediaRecorderLocal.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorderLocal.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const arrayBuffer = await audioBlob.arrayBuffer();

        // Send raw audio data to the main process
        window.electron.ipcRenderer.sendMessage(
          'save-audio',
          // new Uint8Array(arrayBuffer),
          arrayBuffer,
        );

        // Play the recorded audio
        // const audioUrl = URL.createObjectURL(audioBlob);
        // const audio = new Audio(audioUrl);
        // audio.play();
      };

      mediaRecorderLocal.start();
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
    if (isHoldingSpace) {
      audioChunks = [];
      startRecording();
    } else {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHoldingSpace]);

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
            -----------------------------------------------------------------------
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
        {/* <div>
        <h3>Transcribed Text:</h3>
        <p>{transcribedText}</p>
      </div> */}
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
