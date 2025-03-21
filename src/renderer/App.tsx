import { useEffect, useMemo, useRef, useState } from 'react';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import useSpacebarHold from './hooks/useSpacebarHold';

let mediaRecorder: any;
let audioChunks: any[] = [];

function Hello() {
  const frequencyTemplete = useMemo(() => new Array(100).fill(1), []);

  const freqIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [frequencies, setFrequencies] =
    useState<Array<number>>(frequencyTemplete);

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

  function startVisualization() {
    freqIntervalRef.current = setInterval(() => {
      setFrequencies((prevFreq) => [
        ...prevFreq,
        Math.floor(Math.random() * (100 - 10) + 10),
      ]);

      const lastFreq = document.getElementById('scrollContainerId');

      if (lastFreq) {
        lastFreq.scrollBy(250, 0);
      }
    }, 50);
  }

  function stopVisualization() {
    if (freqIntervalRef.current) {
      clearInterval(freqIntervalRef.current);
    }

    setFrequencies(frequencyTemplete);
  }

  useEffect(() => {
    if (recording) {
      startVisualization();
    }

    if (!recording) {
      stopVisualization();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

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
        // const audioUrl = URL.createObjectURL(audioBlob);
        // const audio = new Audio(audioUrl);
        // audio.play();
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
      audioChunks = [];
      startRecording();
    } else {
      stopRecording();
    }
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
      <div
        id="scrollContainerId"
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          overflow: 'auto',
          width: 400,
          height: 120,
          scrollbarWidth: 'none',
          alignItems: 'center',
          columnGap: 3,
        }}
      >
        <div
          id="scrollChildParent"
          style={{
            display: 'flex',
            alignItems: 'center',
            columnGap: 3,
          }}
        >
          {frequencies.map((freq, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              style={{
                width: 5,
                height: freq,
                background: 'white',
                opacity: 0.4,
                borderRadius: 20,
                display: 'inline-block',
              }}
            />
          ))}
        </div>
      </div>
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
