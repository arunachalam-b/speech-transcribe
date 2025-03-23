import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';

import App from '../renderer/App';

describe('App', () => {
  it('should render', async () => {
    await act(async () => {
      const app = render(<App />);
      const appRoot = await waitFor(() => app);
      expect(appRoot).toBeTruthy();
    });
  });
});
