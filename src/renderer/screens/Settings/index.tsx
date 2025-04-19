import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import type { ChangeEvent } from 'react';

import { AVAILABLE_MODELS, COMMUNICATION_CHANNELS } from '../../../constants';

import './index.css';
import { Spinner } from '../../components';

const NO_OPTION = 'NO_OPTION';

function Settings() {
  const navigate = useNavigate();

  const selectedModelRef = useRef<string>();

  const [selectedModel, setSelectedModel] = useState<string>();
  const [isSelectedModelExists, setIsSelectedModelExists] =
    useState<boolean>(true);
  const [isDownloadingModel, setIsDownloadingModel] = useState<boolean>(false);
  const [message, setMessage] = useState(null);

  function startChannelListeners() {
    window.electron.ipcRenderer.on(
      COMMUNICATION_CHANNELS.SELECTED_MODEL,
      (args) => {
        setSelectedModel(args as string);
        selectedModelRef.current = args as string;

        console.log('selected model from store.....', args);
      },
    );

    window.electron.ipcRenderer.on(
      COMMUNICATION_CHANNELS.IS_MODEL_EXIST,
      (args) => {
        setIsSelectedModelExists(args as boolean);
      },
    );

    window.electron.ipcRenderer.on(
      COMMUNICATION_CHANNELS.DONWLOAD_MODEL,
      (args) => {
        if (args) {
          alert(
            `${selectedModelRef.current?.toUpperCase() ?? ''} Model downloaded successfully`,
          );

          setIsSelectedModelExists(true);
        }

        if (!args) {
          alert(
            `${selectedModelRef.current?.toUpperCase() ?? ''} Model download failed`,
          );
        }

        setIsDownloadingModel(false);
      },
    );

    window.electron.ipcRenderer.on(
      COMMUNICATION_CHANNELS.MODEL_DOWNLOAD_STATUS,
      (data: any) => {
        setMessage(data);
      },
    );
  }

  useEffect(() => {
    startChannelListeners();
    window.electron.ipcRenderer.sendMessage(
      COMMUNICATION_CHANNELS.SELECTED_MODEL,
    );
  }, []);

  function onClickBack() {
    navigate('/');
  }

  function onSelectModel(event: ChangeEvent<HTMLSelectElement>) {
    setIsSelectedModelExists(false);

    const model = event.target.value;

    setSelectedModel(model);
    selectedModelRef.current = model;

    window.electron.ipcRenderer.sendMessage(
      COMMUNICATION_CHANNELS.IS_MODEL_EXIST,
      model,
    );
  }

  function onClickDownloadModel() {
    if (
      selectedModel &&
      selectedModel !== NO_OPTION &&
      !isSelectedModelExists
    ) {
      setIsDownloadingModel(true);

      window.electron.ipcRenderer.sendMessage(
        COMMUNICATION_CHANNELS.DONWLOAD_MODEL,
        selectedModel,
      );
    }
  }

  return (
    <div className="container">
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          columnGap: 20,
          paddingInline: 20,
          paddingBlock: 10,
        }}
      >
        <button
          type="button"
          onClick={onClickBack}
          style={{
            backgroundColor: 'unset',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 42,
              fontWeight: 'bolder',
              cursor: 'pointer',
              color: '#FFFFFF',
              lineHeight: 0,
            }}
          >
            &#129128;
          </span>
        </button>
        <h2>Settings</h2>
      </div>
      <div className="content">
        <label htmlFor="modelSelect" id="modelSelectLabel">
          <span>Select Model to use</span>
          <select
            id="modelSelect"
            disabled={isDownloadingModel}
            value={selectedModel}
            onChange={onSelectModel}
          >
            <option value={NO_OPTION}>Select a model</option>
            {AVAILABLE_MODELS.map((model) => (
              <option key={model} value={model}>
                {model.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        {!isSelectedModelExists && selectedModel !== NO_OPTION && (
          <button
            type="button"
            onClick={onClickDownloadModel}
            disabled={selectedModel === NO_OPTION || isDownloadingModel}
          >
            Download
          </button>
        )}
      </div>
      {isDownloadingModel && (
        <div className="content">
          <Spinner />
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line import/prefer-default-export
export { Settings };
