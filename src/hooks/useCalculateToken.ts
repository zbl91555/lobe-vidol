import { getEncoding } from 'js-tiktoken';
import { useMemo } from 'react';

import { pluginSelectors, usePluginStore } from '@/store/plugin';
import { sessionSelectors, useSessionStore } from '@/store/session';

const enc = getEncoding('cl100k_base');

export const useCalculateToken = () => {
  const [currentChatsString, currentAgent] = useSessionStore((s) => [
    sessionSelectors.currentChatsString(s),
    sessionSelectors.currentAgent(s),
  ]);
  const currentSystemRole = useSessionStore((s) => sessionSelectors.currentSystemRole(s));
  const pluginSystemRole = usePluginStore((s) =>
    pluginSelectors.getPluginSystemRole(currentAgent.agentId)(s),
  );
  const messageInput = useSessionStore((s) => s.messageInput);

  const chatLength = useMemo(() => enc.encode(currentChatsString).length, [currentChatsString]);
  const systemRoleLength = useMemo(() => enc.encode(currentSystemRole).length, [currentSystemRole]);
  const messageInputLength = useMemo(() => enc.encode(messageInput).length, [messageInput]);
  const pluginSystemRoleLength = useMemo(
    () => enc.encode(pluginSystemRole).length,
    [pluginSystemRole],
  );

  return chatLength + systemRoleLength + messageInputLength + pluginSystemRoleLength;
};
