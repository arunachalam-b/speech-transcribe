import { useEffect, useRef, useState } from 'react';
import { LiveAudioVisualizer } from 'react-audio-visualize';

import '../App.css';
import useKeyPress from '../hooks/useKeyPress';
import { COMMUNICATION_CHANNELS } from '../../constants';
import { Spinner } from '../components';

let audioChunks: any[] = [];
const waveLineColor = 'rgba(255, 255, 255, 0.75)';

function Home() {
  const enterPress = useKeyPress('Enter');

  const isRecordingRef = useRef<boolean>(false);

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscripting, setIsTranscripting] = useState<boolean>(false);

  async function startRecording() {
    if (isRecordingRef.current) {
      return;
    }

    console.log('Starting Recording...');

    audioChunks = [];
    isRecordingRef.current = true;
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorderLocal = new MediaRecorder(stream);

      mediaRecorderLocal.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorderLocal.onstop = async () => {
        const audioBlobLocal = new Blob(audioChunks, { type: 'audio/wav' });
        const arrayBuffer = await audioBlobLocal.arrayBuffer();

        window.electron.ipcRenderer.sendMessage(
          COMMUNICATION_CHANNELS.SAVE_AUDIO,
          arrayBuffer,
        );
      };

      mediaRecorderLocal.start();
      setMediaRecorder(mediaRecorderLocal);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      console.log('Stopping Recording...');
      mediaRecorder.stop();
      setMediaRecorder(undefined);
      isRecordingRef.current = false;
      setIsRecording(false);
      setIsTranscripting(true);
    }
  }

  const onFocus = () => {
    startRecording();
  };

  function addFocusListener() {
    window.addEventListener('focus', onFocus);
  }

  function removeFocusListener() {
    window.removeEventListener('focus', onFocus);
  }

  function startEventListeners() {
    window.electron.ipcRenderer.on(
      COMMUNICATION_CHANNELS.TRANSCRIPTION_STATUS,
      (status) => {
        if (!status) {
          return;
        }

        setIsTranscripting(status as boolean);
      },
    );
  }

  function tearDown() {
    setIsTranscripting(false);
  }

  function onMount() {
    onFocus();
    addFocusListener();
    startEventListeners();
  }

  function onUnmount() {
    removeFocusListener();

    tearDown();
  }

  useEffect(() => {
    onMount();

    return () => {
      onUnmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (enterPress) {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterPress]);

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        height: '100vh',
        flexDirection: 'column',
        rowGap: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!isTranscripting && (
        <>
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
              }}
            >
              <span style={{ color: waveLineColor }} />
            </div>
          )}
          <div>
            {!isRecording && (
              <button onClick={startRecording} type="button">
                Start Recording
              </button>
            )}
            {isRecording && (
              <button onClick={stopRecording} type="button">
                Stop Recording
              </button>
            )}
            <div>
              <p>
                <i>
                  Press{' '}
                  <span>
                    <b>Enter</b>
                  </span>{' '}
                  key to transcribe
                </i>
              </p>
            </div>
          </div>
        </>
      )}

      {isTranscripting && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 20,
          }}
        >
          <Spinner />
          <span style={{ fontSize: 28, fontWeight: '700' }}>
            Voice is translating to text...
          </span>
        </div>
      )}
    </div>
  );
}

export { Home };
