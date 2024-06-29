import { produce } from 'immer';
import { keyBy } from 'lodash-es';

import type { Plugin } from '@/types/plugin';

import { PluginStore } from './index';

export const isPluginInstalling = (identifier: string) => (s: PluginStore) => {
  return s.installingPluginIds.includes(identifier);
};

export const isPluginInstalled = (identifier: string) => (s: PluginStore) => {
  return s.installedPluginIds.includes(identifier);
};

export const getAllPlugins = (s: PluginStore) => {
  const { allPlugins, pluginSettingValueMap } = s;
  return allPlugins.map((plugin) => {
    const { identifier } = plugin;

    produce(plugin, (state) => {
      if (state.settings) {
        state.settings.value = pluginSettingValueMap[identifier];
      }
    });

    return plugin;
  });
};

export const getPluginById = (identifier: string) => (s: PluginStore) => {
  const allPlugins = getAllPlugins(s);
  return allPlugins.find((plugin) => plugin.identifier === identifier);
};

export const getInstalledPlugins = (s: PluginStore) => {
  const { installedPluginIds } = s;

  const pluginMap = keyBy(getAllPlugins(s), 'identifier');

  // 已安装的插件可能在应用市场中已下架
  return installedPluginIds.map((id) => pluginMap[id]).filter(Boolean) as Plugin[];
};

export const getAgentEnablePlugins = (agentId: string) => (s: PluginStore) => {
  const enabledPluginIds = s.enabledAgentPluginIdsMap[agentId];
  const pluginMap = keyBy(getAllPlugins(s), 'identifier');

  return enabledPluginIds.map((id) => pluginMap[id]).filter(Boolean) as Plugin[];
};
