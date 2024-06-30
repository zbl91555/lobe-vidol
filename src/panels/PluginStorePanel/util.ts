import { Plugin } from '@/types/plugin';

export const hasPluginSettings = (plugin?: Plugin) => {
  const settingsProperties = plugin?.pluginManifest?.settings?.properties;

  console.log(plugin);

  return settingsProperties && Object.keys(settingsProperties).length > 0;
};
