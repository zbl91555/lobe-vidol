import { LobeChatPluginManifest, LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';

export type PluginType = 'builtin' | 'customPlugin' | 'plugin';

export interface Plugin extends LobeChatPluginMeta {
  /**
   * 插件 manifest
   */
  pluginManifest?: LobeChatPluginManifest;
  /**
   * 插件配置
   */
  pluginSettingsValue?: Record<string, any>;
  /**
   * 插件类型
   */
  type: PluginType;
}
