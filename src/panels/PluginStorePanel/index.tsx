'use client';

import React from 'react';

import PanelContainer from '@/panels/PanelContainer';

import Plugin from './Plugin';

interface PluginStoreProps {
  className?: string;
  style?: React.CSSProperties;
}

const PluginStore = (props: PluginStoreProps) => {
  const { style, className } = props;

  return (
    <PanelContainer className={className} panelKey="pluginStore" style={style} title="插件商店">
      <Plugin />
    </PanelContainer>
  );
};

export default PluginStore;
