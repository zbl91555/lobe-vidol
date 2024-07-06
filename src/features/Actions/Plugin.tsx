import { ActionIcon, Avatar, Icon } from '@lobehub/ui';
import { Checkbox, Dropdown, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { keyBy } from 'lodash-es';
import { ArrowRight, Blocks, Store } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { useAgentStore } from '@/store/agent';
import { useGlobalStore } from '@/store/global';
import { pluginSelectors, usePluginStore } from '@/store/plugin';

const { Text } = Typography;

const useStyles = createStyles(({ css, prefixCls }) => ({
  menu: css`
    &.${prefixCls}-dropdown-menu {
      padding-block: 8px;
    }

    .${prefixCls}-dropdown-menu-item-group-list .${prefixCls}-dropdown-menu-item {
      padding: 0;
      border-radius: 4px;
    }
  `,
  pluginItem: css`
    display: flex;
    align-items: center;
    width: 245px;
    margin: 0 8px;
  `,
  pluginAvatar: css`
    margin-right: 12px;
    color: black;
  `,
  pluginTitle: css`
    margin-right: auto;
  `,
}));

export default () => {
  const { styles } = useStyles();

  const [isOpen, setIsOpen] = useState(false);

  const [openPanel] = useGlobalStore((s) => [s.openPanel]);
  const [currentAgentId] = useAgentStore((s) => [s.currentIdentifier]);
  const [installedPlugins, enabledPlugins, enablePlugin, disablePlugin] = usePluginStore((s) => [
    pluginSelectors.getInstalledPlugins(s),
    pluginSelectors.getAgentEnabledPlugins(currentAgentId)(s),
    s.enablePlugin,
    s.disablePlugin,
  ]);

  const enabledPluginMap = keyBy(enabledPlugins, 'identifier');

  const renderMenuItemLabel = (data: { action: ReactNode, avatar: ReactNode; title: string; }) => {
    const { avatar, title, action } = data;

    return (
      <div className={styles.pluginItem}>
        <Avatar size={24} src={avatar} className={styles.pluginAvatar} />
        <Text ellipsis={{ tooltip: true }} className={styles.pluginTitle}>
          {title}
        </Text>
        {action}
      </div>
    );
  };

  const isChecked = (identifier: string) => !!enabledPluginMap[identifier];

  const installedPluginItems = installedPlugins.map((plugin) => {
    const { meta, identifier } = plugin;

    return {
      key: identifier,
      label: renderMenuItemLabel({
        avatar: meta.avatar,
        title: meta.title,
        action: <Checkbox checked={isChecked(identifier)} />,
      }),
      onClick: () => {
        if (isChecked(identifier)) {
          disablePlugin(identifier);
        } else {
          enablePlugin(identifier);
        }
      },
    };
  });

  const pluginItems = [
    ...installedPluginItems,
    {
      key: 'pluginStore',
      label: renderMenuItemLabel({
        avatar: <Icon icon={Store} size={{ fontSize: 16 }} style={{ padding: 4 }} />,
        title: '插件商店',
        action: <Icon icon={ArrowRight} size={{ fontSize: 16 }} style={{ padding: 4 }} />,
      }),
      onClick: () => {
        setIsOpen(false);
        openPanel('pluginStore');
      },
    },
  ];

  return (
    <Dropdown
      open={isOpen}
      onOpenChange={(isOpen, { source }) => {
        if (!isOpen && source === 'menu') return;
        setIsOpen(isOpen);
      }}
      menu={{
        className: styles.menu,
        items: pluginItems,
        style: {
          maxHeight: 500,
          overflowY: 'scroll',
        },
      }}
      placement="top"
      trigger={['click']}
    >
      <ActionIcon icon={Blocks} title="扩展插件" />
    </Dropdown>
  );
};
