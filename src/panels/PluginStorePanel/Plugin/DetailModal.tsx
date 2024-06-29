import { Avatar, Modal, ModalProps, TabsNav, Tag } from '@lobehub/ui';
import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import { startCase } from 'lodash-es';
import React, { FC, Ref, useImperativeHandle, useState } from 'react';
import useMergeState from 'use-merge-value';

import { pluginSelectors, usePluginStore } from '@/store/plugin';

import { PluginDetailModalTabKeyEnum } from '../const';

export interface ActionType {
  open: (modalProps: { activeTabKey?: PluginDetailModalTabKeyEnum, identifier: string; }) => void;
}

interface PluginDetailModalProps extends ModalProps {
  actionRef?: Ref<ActionType>;
  activeTabKey?: PluginDetailModalTabKeyEnum;
  identifier: string;
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

  const { activeTabKey: activeTabKeyProp, actionRef, ...restModalProps } = props;

  const [identifier, setIdentifier] = useState<string>('');
  const [activeTabKey, setActiveTabKey] = useMergeState(PluginDetailModalTabKeyEnum.Api, {
    value: activeTabKeyProp,
  });

  useImperativeHandle(actionRef, () => {
    return {
      open: (modalProps) => {
        const { identifier } = modalProps;
        setIdentifier(identifier);
      },
    };
  });

  const [plugin] = usePluginStore((s) => [pluginSelectors.getPluginById(identifier)(s)]);

  const pluginMeta = plugin?.meta;

  return (
    <Modal title="插件详情" {...restModalProps}>
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
          activeKey={activeTabKey}
          onTabClick={(activeTabKey) => {
            setActiveTabKey(activeTabKey as PluginDetailModalTabKeyEnum);
          }}
          variant={'compact'}
        ></TabsNav>
      </div>
    </Modal>
  );
};
PluginDetailModal.displayName = 'PluginDetailModal';

export default PluginDetailModal;
