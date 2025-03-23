import { useNavigate } from 'react-router';

function Settings() {
  const navigate = useNavigate();

  function onClickBack() {
    navigate('/');
  }

  return (
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
  );
}

// eslint-disable-next-line import/prefer-default-export
export { Settings };
