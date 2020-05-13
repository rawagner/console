import * as React from 'react';
import { AsyncComponent } from '../utils/async';

export const Area = (props) => (
  <AsyncComponent loader={() => import('./graph-loader').then((c) => c.Area)} {...props} />
);
export const Bar = (props) => (
  <AsyncComponent loader={() => import('./graph-loader').then((c) => c.Bar)} {...props} />
);
export const Gauge = (props) => (
  <AsyncComponent loader={() => import('./graph-loader').then((c) => c.Gauge)} {...props} />
);
