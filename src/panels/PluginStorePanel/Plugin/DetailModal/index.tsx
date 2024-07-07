import { Avatar, Modal, ModalProps, TabsNav, TabsNavProps, Tag } from '@lobehub/ui';
import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import { startCase } from 'lodash-es';
import React, { FC, Ref, useEffect, useImperativeHandle, useState } from 'react';
import useMergeState from 'use-merge-value';

import PluginSettings from '@/features/PluginSettings';
import { pluginSelectors, usePluginStore } from '@/store/plugin';

import { PluginDetailModalTabKeyEnum } from '../../const';
import { hasPluginSettings } from '../../util';
import ApiTable from './ApiTable';

export interface ActionType {
  open: (props?: Pick<PluginDetailModalProps, 'identifier' | 'activeTabKey'>) => void;
}

interface PluginDetailModalProps extends ModalProps {
  actionRef?: Ref<ActionType>;
  activeTabKey?: PluginDetailModalTabKeyEnum;
  identifier?: string;
}

const useStyles = createStyles(({ css, token }) => ({
  modalContent: css`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  title: css`
    margin-top: 20px;
    font-size: 20px;
    font-weight: 600;
    text-align: center;
  `,

  tags: css`
    margin-top: 12px;
    margin-right: 6px;
  `,
  desc: css`
    margin-top: 12px;
    color: ${token.colorTextDescription};
    text-align: center;
  `,
}));

const PluginDetailModal: FC<PluginDetailModalProps> = (props) => {
  const { styles, theme } = useStyles();

  const { actionRef, ...restModalProps } = props;

  const [pluginSettingsValue, setPluginSettingsValue] = useState({});
  const [open, setOpen] = useMergeState(false, {
    value: props.open,
  });
  const [identifier, setIdentifier] = useMergeState('', {
    value: props.identifier,
  });
  const [activeTabKey, setActiveTabKey] = useMergeState(PluginDetailModalTabKeyEnum.Api, {
    value: props.activeTabKey,
  });

  const [plugin, updatePluginSettingsValue] = usePluginStore((s) => [
    pluginSelectors.getPluginById(identifier)(s),
    s.updatePluginSettingsValue,
  ]);

  useImperativeHandle(actionRef, () => {
    return {
      open: (modalProps = {}) => {
        const { identifier, activeTabKey } = modalProps;

        if (identifier) {
          setIdentifier(identifier);
        }
        if (activeTabKey) {
          setActiveTabKey(activeTabKey);
        }

        setOpen(true);
      },
    };
  });

  useEffect(() => {
    if (plugin?.pluginSettingsValue) {
      setPluginSettingsValue(plugin.pluginSettingsValue);
    }
  }, [plugin?.pluginSettingsValue]);

  const pluginMeta = plugin?.meta;
  const hasSettings = hasPluginSettings(plugin);

  return (
    <Modal
      title="插件详情"
      {...restModalProps}
      open={open}
      onOk={() => {
        if (hasSettings) {
          updatePluginSettingsValue(identifier, pluginSettingsValue);
        }
        setOpen(false);
      }}
      onCancel={() => {
        setOpen(false);
      }}
    >
      <div className={styles.modalContent}>
        <Avatar
          src={pluginMeta?.avatar}
          background={theme.colorFillTertiary}
          size={100}
          animation
        />
        <div className={styles.title}>{pluginMeta?.title}</div>
        <div className={styles.tags}>
          {pluginMeta?.tags?.map((tag) => {
            return <Tag key={tag}>{startCase(tag).trim()}</Tag>;
          })}
        </div>
        <div className={styles.desc}>{pluginMeta?.description}</div>
        <Divider style={{ marginBottom: 0, marginTop: 8 }} />
        <TabsNav
          items={
            [
              {
                key: PluginDetailModalTabKeyEnum.Api,
                label: '插件能力',
              },
              hasSettings && {
                key: PluginDetailModalTabKeyEnum.Settings,
                label: '设置',
              },
            ].filter(Boolean) as TabsNavProps['items']
          }
          activeKey={activeTabKey}
          onTabClick={(activeTabKey) => {
            setActiveTabKey(activeTabKey as PluginDetailModalTabKeyEnum);
          }}
          variant={'compact'}
        />
        {activeTabKey === PluginDetailModalTabKeyEnum.Api && <ApiTable identifier={identifier} />}
        {activeTabKey === PluginDetailModalTabKeyEnum.Settings && (
          <PluginSettings
            schema={plugin?.pluginManifest?.settings}
            value={pluginSettingsValue}
            onChange={setPluginSettingsValue}
          />
        )}
      </div>
    </Modal>
  );
};
PluginDetailModal.displayName = 'PluginDetailModal';

export default PluginDetailModal;
