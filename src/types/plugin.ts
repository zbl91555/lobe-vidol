import { LobeChatPluginManifest, PluginSchema } from '@lobehub/chat-plugin-sdk';

export interface PluginIndexResponse {
  plugins: LobeChatPluginManifest[];
  schemaVersion: 1;
  tags: string[];
}

export type PluginType = 'builtin' | 'customPlugin' | 'plugin';

export interface Plugin extends LobeChatPluginManifest {
  /**
   * 插件类型
   */
  pluginType: PluginType;

  /**
   * 插件配置项
   */
  settings?: PluginSchema & {
    /**
     * 插件配置项数据
     */
    value?: Record<string, any>;
  };
}
