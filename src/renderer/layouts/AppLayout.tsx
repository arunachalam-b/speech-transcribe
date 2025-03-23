import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

import { COMMUNICATION_CHANNELS } from '../../constants';

import type { UpdateRendererRouteArgs } from '../../types';

function AppLayout() {
  const navigate = useNavigate();

  function onUpdateRendererRoute(args: UpdateRendererRouteArgs) {
    navigate(args.route);
  }

  function startRendererRouteListener() {
    window.electron.ipcRenderer.on(
      COMMUNICATION_CHANNELS.UPDATE_RENDERER_ROUTE,
      (args) => {
        onUpdateRendererRoute(args as UpdateRendererRouteArgs);
      },
    );
  }

  function onMount() {
    startRendererRouteListener();
  }

  useEffect(() => {
    onMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Outlet />;
}

export { AppLayout };
