import { Route, MemoryRouter as Router, Routes } from 'react-router';

import './App.css';
import { Home, Settings } from './screens';
import { RENDERER_ROUTE } from '../constants';
import { AppLayout } from './layouts';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path={RENDERER_ROUTE.ROOT} element={<Home />} />
          <Route path={RENDERER_ROUTE.SETTINGS} element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
