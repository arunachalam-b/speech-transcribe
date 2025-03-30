import {
  RENDERER_ROUTE,
  RENDERER_ROUTE_ACTION,
  storageKeys,
} from './constants';

type UpdateRendererRouteArgs = {
  action: RENDERER_ROUTE_ACTION;
  route: RENDERER_ROUTE;
};

type AppStoreType = {
  [storageKeys.SELECTED_MODEL]?: string;
  [storageKeys.SELECTED_MODEL_PATH]?: string;
};

export type { UpdateRendererRouteArgs, AppStoreType };
