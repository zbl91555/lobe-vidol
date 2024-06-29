import { ActionIcon, Icon } from '@lobehub/ui';
import { App, Button, Dropdown } from 'antd';
import { InfoIcon, MoreVerticalIcon, Settings, Trash2 } from 'lucide-react';
import React, { FC, useState } from 'react';

import { pluginSelectors, usePluginStore } from '@/store/plugin';
import { Plugin } from '@/types/plugin';

import PluginDetailModal from './DetailModal';

interface PluginActionProps {
  identifier: Plugin['identifier'];
}

const PluginAction: FC<PluginActionProps> = (props) => {
  const { identifier } = props;
  const { modal } = App.useApp();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [plugin, isInstalled, isInstalling, uninstallPlugin, installPlugin] = usePluginStore(
    (s) => [
      pluginSelectors.getPluginById(identifier)(s),
      pluginSelectors.isPluginInstalled(identifier)(s),
      pluginSelectors.isPluginInstalling(identifier)(s),
      s.uninstallPlugin,
      s.installPlugin,
    ],
  );

  const hasSettings =
    plugin?.settings?.properties && Object.keys(plugin.settings.properties).length > 0;

  if (isInstalled) {
    return (
      <>
        {hasSettings && <ActionIcon icon={Settings} title="设置" />}
        <Dropdown
          menu={{
            items: [
              {
                icon: <Icon icon={InfoIcon} />,
                key: 'detail',
                label: '详情',
                onClick: () => {
                  setIsDetailModalOpen(true);
                },
              },
              {
                danger: true,
                icon: <Icon icon={Trash2} />,
                key: 'uninstall',
                label: '卸载',
                onClick: () => {
                  modal.confirm({
                    centered: true,
                    okButtonProps: { danger: true },
                    onOk: () => {
                      uninstallPlugin(identifier);
                    },
                    title: '即将卸载该插件，卸载后将清除该插件配置，请确认你的操作',
                    type: 'error',
                  });
                },
              },
            ],
          }}
        >
          <ActionIcon icon={MoreVerticalIcon} />
        </Dropdown>
        <PluginDetailModal
          identifier={identifier}
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
        />
      </>
    );
  } else {
    return (
      <Button
        type="primary"
        loading={isInstalling}
        onClick={() => {
          installPlugin(identifier);
        }}
      >
        安装
      </Button>
    );
  }
};
PluginAction.displayName = 'PluginAction';

export default PluginAction;
