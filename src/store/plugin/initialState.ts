import { Plugin } from '@/types/plugin';

export const initialState = {
  allPlugins: [] as Plugin[],

  installedPluginIds: [],

  pluginManifestMap: {},

  installingPluginIds: [],

  pluginSettingsValueMap: {},

  enabledAgentPluginIdsMap: {},
};
