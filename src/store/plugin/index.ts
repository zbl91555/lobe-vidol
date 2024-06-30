import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { getPluginIndex, getPluginManifest } from '@/services/plugin';
import { Plugin } from '@/types/plugin';

import { useAgentStore } from '../agent';
import { initialState } from './initialState';
import * as pluginSelectors from './selectors';

const PLUGIN_STORAGE_KEY = 'vidol-chat-plugin-storage';

export interface PluginStore {
  /**
   * 应用商店获的插件
   */
  allPlugins: Plugin[];

  /**
   * 卸载插件
   */
  disablePlugin: (pluginId: string) => void;
  /**
   * 启用插件
   */
  enablePlugin: (pluginId: string) => void;
  /**
   * 角色启用的插件
   */
  enabledAgentPluginIdsMap: Record<string, string[]>;
  /**
   * 获取插件商店列表
   */
  fetchPluginIndex: () => Promise<void>;
  /**
   * 安装插件
   */
  installPlugin: (identifier: string) => void;

  /**
   * 已安装的插件标识
   */
  installedPluginIds: string[];
  /**
   * 正在安装的插件标识
   */
  installingPluginIds: string[];
  /**
   * 插件 manifest
   */
  pluginManifestMap: Record<string, LobeChatPluginManifest>;
  /**
   * 插件配置值
   */
  pluginSettingsValueMap: Record<string, Record<string, any>>;
  /**
   * 卸载插件
   */
  uninstallPlugin: (identifier: string) => void;
  /**
   * 更新插件配置
   */
  updatePluginSettingsValue: (identifier: string, value: Record<string, any>) => void;
}

const createPluginStore: StateCreator<PluginStore, [['zustand/devtools', never]]> = (set, get) => ({
  ...initialState,

  fetchPluginIndex: async () => {
    const { plugins } = await getPluginIndex();

    if (Array.isArray(plugins)) {
      set({
        allPlugins: plugins.map((plugin) => {
          return {
            ...plugin,
            type: 'plugin',
          };
        }),
      });
    }
  },

  enablePlugin: (pluginId) => {
    const currentAgentId = useAgentStore.getState().currentIdentifier;

    set((state) => {
      const enabledPluginIds = state.enabledAgentPluginIdsMap[currentAgentId];
      if (Array.isArray(enabledPluginIds)) {
        enabledPluginIds.push(pluginId);
      } else {
        state.enabledAgentPluginIdsMap[currentAgentId] = [pluginId];
      }

      return state;
    });
  },

  disablePlugin: (pluginId) => {
    const currentAgentId = useAgentStore.getState().currentIdentifier;

    set((state) => {
      const enabledPluginIds = state.enabledAgentPluginIdsMap[currentAgentId];
      if (Array.isArray(enabledPluginIds)) {
        enabledPluginIds.splice(enabledPluginIds.indexOf(pluginId), 1);
      }

      return state;
    });
  },

  installPlugin: async (identifier) => {
    set((state) => {
      state.installingPluginIds.push(identifier);
      return state;
    });

    // 安装时需要获取 plugin manifest
    const plugin = pluginSelectors.getPluginById(identifier)(get());

    const pluginManifest = await getPluginManifest(plugin?.manifest);

    set((state) => {
      state.installingPluginIds.splice(state.installingPluginIds.indexOf(identifier), 1);

      state.installedPluginIds.push(identifier);
      state.pluginManifestMap[identifier] = pluginManifest;
      return state;
    });
  },

  uninstallPlugin: (identifier) => {
    set((state) => {
      state.installedPluginIds.splice(state.installedPluginIds.indexOf(identifier), 1);
      delete state.pluginManifestMap[identifier];
      return state;
    });
  },

  updatePluginSettingsValue: (identifier, value) => {
    set((state) => {
      state.pluginSettingsValueMap[identifier] = value;
      return state;
    });
  },
});

export const usePluginStore = createWithEqualityFn<PluginStore>()(
  subscribeWithSelector(
    persist(
      devtools(immer(createPluginStore), {
        name: 'VIDOL_PLUGIN_STORE',
      }),
      {
        name: PLUGIN_STORAGE_KEY,
        partialize: (state) => {
          return {
            installedPluginIds: state.installedPluginIds,
            pluginManifestMap: state.pluginManifestMap,
          };
        },
      },
    ),
  ),
  shallow,
);



export * as pluginSelectors from './selectors';