import { produce } from 'immer';
import { keyBy, uniqBy } from 'lodash-es';

import { ChatCompletionTool } from '@/types/openai/chat';
import type { Plugin } from '@/types/plugin';
import { genToolCallingName } from '@/utils/toolCall';

import { PluginStore } from './index';

export const isPluginInstalling = (identifier: string) => (s: PluginStore) => {
  return s.installingPluginIds.includes(identifier);
};

export const isPluginInstalled = (identifier: string) => (s: PluginStore) => {
  return s.installedPluginIds.includes(identifier);
};

export const getAllPlugins = (s: PluginStore) => {
  const { allPlugins, pluginManifestMap, pluginSettingsValueMap } = s;
  return allPlugins.map((plugin) => {
    const { identifier } = plugin;

    return produce(plugin, (state) => {
      state.pluginManifest = pluginManifestMap[identifier];
      state.pluginSettingsValue = pluginSettingsValueMap[identifier];
      return state;
    });
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

export const getAgentEnabledPlugins = (agentId: string) => (s: PluginStore) => {
  const enabledPluginIds = s.enabledAgentPluginIdsMap[agentId];
  const pluginMap = keyBy(getAllPlugins(s), 'identifier');

  return (enabledPluginIds?.map((id) => pluginMap[id]).filter(Boolean) || []) as Plugin[];
};

export const getPluginSystemRole = (agentId: string) => (s: PluginStore) => {
  const toolSystemRoleMessages = getAgentEnabledPlugins(agentId)(s).map((plugin) => {
    const manifest = plugin.pluginManifest;
    if (!manifest) return '';

    const { meta } = manifest;

    const title = meta.title || manifest.identifier;
    const systemRole = manifest.systemRole || meta.description;

    const methods = manifest.api
      .map((m) =>
        [
          `#### ${genToolCallingName(manifest.identifier, m.name, manifest.type)}`,
          m.description,
        ].join('\n\n'),
      )
      .join('\n\n');

    return [`### ${title}`, systemRole, 'The APIs you can use:', methods].join('\n\n');
  });

  if (toolSystemRoleMessages.length > 0) {
    return ['## Tools', 'You can use these tools below:', ...toolSystemRoleMessages]
      .filter(Boolean)
      .join('\n\n');
  }

  return '';
};

export const getToolsSchema = (agentId: string) => (s: PluginStore) => {
  const tools = getAgentEnabledPlugins(agentId)(s).flatMap((plugin) => {
    const manifest = plugin.pluginManifest;
    if (!manifest) return [];
    const { api } = manifest;

    return api.map((m) => ({
      description: m.description,
      name: genToolCallingName(manifest.identifier, m.name, manifest.type),
      parameters: m.parameters,
    }));
  });

  return uniqBy(tools, 'name').map((tool) => ({
    type: 'function',
    function: tool,
  })) as ChatCompletionTool[];
};
