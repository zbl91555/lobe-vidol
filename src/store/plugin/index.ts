import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { getPluginIndex } from '@/services/plugin';
import { Plugin } from '@/types/plugin';

import { initialState } from './initialState';

const PLUGIN_STORAGE_KEY = 'vidol-chat-plugin-storage';

export interface PluginStore {
  /**
   * 应用商店获的插件
   */
  allPlugins: Plugin[];
  /**
   * 卸载插件
   */
  disablePlugin: (agentId: string, pluginId: string) => void;
  /**
   * 启用插件
   */
  enablePlugin: (agentId: string, pluginId: string) => void;
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
   * 禁用插件
   */
/**
   * 已安装的插件标识
   */
  installedPluginIds: string[];
  /**
   * 正在安装的插件标识
   */
  installingPluginIds: string[];
  /**
   * 插件配置值
   */
  pluginSettingValueMap: Record<string, Record<string, any>>;
  /**
   * 卸载插件
   */
  uninstallPlugin: (identifier: string) => void;
  /**
   * 更新插件配置
   */
  updatePluginSettingValue: (identifier: string, value: Record<string, any>) => void;
}

const createPluginStore: StateCreator<PluginStore, [['zustand/devtools', never]]> = (set) => ({
  ...initialState,
  fetchPluginIndex: async () => {
    const { plugins } = await getPluginIndex();

    if (Array.isArray(plugins)) {
      set({
        allPlugins: plugins.map((plugin) => {
          return {
            ...plugin,
            pluginType: 'plugin',
          };
        }),
      });
    }
  },
  enablePlugin: (agentId, pluginId) => {
    set((state) => {
      const enabledPluginIds = state.enabledAgentPluginIdsMap[agentId];
      if (Array.isArray(enabledPluginIds)) {
        enabledPluginIds.push(pluginId);
      } else {
        state.enabledAgentPluginIdsMap[agentId] = [pluginId];
      }

      return state;
    });
  },
  disablePlugin: (agentId, pluginId) => {
    set((state) => {
      const enabledPluginIds = state.enabledAgentPluginIdsMap[agentId];
      if (Array.isArray(enabledPluginIds)) {
        enabledPluginIds.splice(enabledPluginIds.indexOf(pluginId), 1);
      }

      return state;
    });
  },

  installPlugin: (identifier) => {
    set((state) => {
      state.installingPluginIds.push(identifier);
      state.installedPluginIds.push(identifier);
      return state;
    });

    // 取消 loading
    set((state) => {
      state.installingPluginIds.splice(state.installingPluginIds.indexOf(identifier), 1);
      return state;
    });
  },
  uninstallPlugin: (identifier) => {
    set((store) => {
      store.installedPluginIds.splice(store.installedPluginIds.indexOf(identifier), 1);
      return store;
    });
  },

  updatePluginSettingValue: (identifier, value) => {
    set((state) => {
      state.pluginSettingValueMap[identifier] = value;
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
          };
        },
      },
    ),
  ),
  shallow,
);

export * as pluginSelectors from './selectors';
