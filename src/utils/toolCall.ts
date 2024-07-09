import { produce } from 'immer';
import { Md5 } from 'ts-md5';
import { z } from 'zod';

import { PLUGIN_SCHEMA_API_MD5_PREFIX, PLUGIN_SCHEMA_SEPARATOR } from '@/constants/plugin';
import type { ToolCallMessage } from '@/types/chat';

export const genToolCallingName = (identifier: string, name: string, type: string = 'default') => {
  const pluginType = type && type !== 'default' ? `${PLUGIN_SCHEMA_SEPARATOR + type}` : '';

  // 将插件的 identifier 作为前缀，避免重复
  let apiName = identifier + PLUGIN_SCHEMA_SEPARATOR + name + pluginType;

  // OpenAI GPT function_call name can't be longer than 64 characters
  // So we need to use md5 to shorten the name
  // and then find the correct apiName in response by md5
  if (apiName.length >= 64) {
    const md5Content = PLUGIN_SCHEMA_API_MD5_PREFIX + Md5.hashStr(name).toString();

    apiName = identifier + PLUGIN_SCHEMA_SEPARATOR + md5Content + pluginType;
  }

  return apiName;
};

export const MessageToolCallSchema = z.object({
  function: z.object({
    arguments: z.string(),
    name: z.string(),
  }),
  id: z.string(),
  type: z.string(),
});

export const parseToolCalls = (origin: ToolCallMessage[], newMessage: ToolCallMessage[]) =>
  produce(origin, (draft) => {
    draft.push(...newMessage.map((message) => MessageToolCallSchema.parse(message)));
  });
