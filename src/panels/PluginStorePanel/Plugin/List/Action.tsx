import { ActionIcon, Icon } from '@lobehub/ui';
import { App, Button, Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import { InfoIcon, MoreVerticalIcon, Settings, Trash2 } from 'lucide-react';
import React, { FC, useRef } from 'react';

import { pluginSelectors, usePluginStore } from '@/store/plugin';
import { Plugin } from '@/types/plugin';

import { PluginDetailModalTabKeyEnum } from '../../const';
import { hasPluginSettings } from '../../util';
import PluginDetailModal, { ActionType } from '../DetailModal';

interface PluginActionProps {
  identifier: Plugin['identifier'];
}

const useStyles = createStyles(({ css }) => ({
  container: css`
    display: flex;
    align-items: center;
  `,
}));

const PluginAction: FC<PluginActionProps> = (props) => {
  const { identifier } = props;
  const { modal } = App.useApp();

  const { styles } = useStyles();

  const modalActionRef = useRef<ActionType>(null);

  const [plugin, isInstalled, isInstalling, uninstallPlugin, installPlugin] = usePluginStore(
    (s) => [
      pluginSelectors.getPluginById(identifier)(s),
      pluginSelectors.isPluginInstalled(identifier)(s),
      pluginSelectors.isPluginInstalling(identifier)(s),
      s.uninstallPlugin,
      s.installPlugin,
    ],
  );

  if (isInstalled) {
    return (
      <div className={styles.container}>
        {hasPluginSettings(plugin) && (
          <ActionIcon
            icon={Settings}
            title="设置"
            onClick={() => {
              modalActionRef.current?.open({
                activeTabKey: PluginDetailModalTabKeyEnum.Settings,
              });
            }}
          />
        )}
        <Dropdown
          menu={{
            items: [
              {
                icon: <Icon icon={InfoIcon} />,
                key: 'detail',
                label: '详情',
                onClick: () => {
                  modalActionRef.current?.open();
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
        <PluginDetailModal identifier={identifier} actionRef={modalActionRef} />
      </div>
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
