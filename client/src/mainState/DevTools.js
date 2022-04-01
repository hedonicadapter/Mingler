import React from 'react';
import { createDevTools } from '@redux-devtools/core';
import LogMonitor from '@redux-devtools/log-monitor';
import DockMonitor from '@redux-devtools/dock-monitor';

export default createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h" defaultIsVisible={true}>
    <LogMonitor />
  </DockMonitor>
);
