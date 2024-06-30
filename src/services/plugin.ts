import {
  LobeChatPluginManifest,
  LobeChatPluginsMarketIndex,
  pluginManifestSchema,
} from '@lobehub/chat-plugin-sdk';

import { OpenAIPluginManifest } from '@/types/openai/plugin';

const fetchJSON = async <T = any>(url: string): Promise<T> => {
  // 2. 发送请求
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new TypeError('fetchError');
  }

  if (!res.ok) {
    throw new TypeError('fetchError');
  }

  let data;
  const contentType = res.headers.get('Content-Type');

  try {
    if (contentType === 'application/json') {
      data = await res.json();
    } else {
      const { default: YAML } = await import('yaml');

      const yaml = await res.text();
      data = YAML.parse(yaml);
    }
  } catch {
    throw new TypeError('urlError');
  }

  return data;
};

const convertOpenAIManifestToLobeManifest = (
  data: OpenAIPluginManifest,
): LobeChatPluginManifest => {
  const manifest: LobeChatPluginManifest = {
    api: [],
    homepage: data.legal_info_url,
    identifier: data.name_for_model,
    meta: {
      avatar: data.logo_url,
      description: data.description_for_human,
      title: data.name_for_human,
    },
    openapi: data.api.url,
    systemRole: data.description_for_model,
    type: 'default',
    version: '1',
  };
  switch (data.auth.type) {
    case 'none': {
      break;
    }
    case 'service_http': {
      manifest.settings = {
        properties: {
          apiAuthKey: {
            default: data.auth.verification_tokens['openai'],
            description: 'API Key',
            format: 'password',
            title: 'API Key',
            type: 'string',
          },
        },
        type: 'object',
      };
      break;
    }
  }

  return manifest;
};

/**
 * 获取插件列表
 */
export const getPluginIndex = async () => {
  const res = await fetch('/api/plugin/store?locale=zh-CN', {
    method: 'GET',
  });

  return res.json() as Promise<LobeChatPluginsMarketIndex>;
};

/**
 * 获取插件 manifest
 */
export const getPluginManifest = async (url?: string) => {
  if (!url) {
    throw new TypeError('noManifest');
  }

  let data = await fetchJSON<LobeChatPluginManifest>(url);

  // @ts-ignore
  // if there is a description_for_model, it is an OpenAI plugin
  // we need convert to lobe plugin
  if (data.description_for_model) {
    data = convertOpenAIManifestToLobeManifest(data as any);
  }

  // 3. 校验插件文件格式规范
  const parser = pluginManifestSchema.safeParse(data);

  if (!parser.success) {
    throw new TypeError('manifestInvalid', { cause: parser.error });
  }

  // 4. if exist OpenAPI api, merge the OpenAPIs to api
  if (parser.data.openapi) {
    const openapiJson = await fetchJSON(parser.data.openapi);

    try {
      const { OpenAPIConvertor } = await import('@lobehub/chat-plugin-sdk/openapi');

      const convertor = new OpenAPIConvertor(openapiJson);
      const openAPIs = await convertor.convertOpenAPIToPluginSchema();
      data.api = [...data.api, ...openAPIs];

      data.settings = await convertor.convertAuthToSettingsSchema(data.settings);
    } catch (error) {
      throw new TypeError('openAPIInvalid', { cause: error });
    }
  }

  return data;
};
