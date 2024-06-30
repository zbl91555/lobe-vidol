import { Avatar } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import classNames from 'classnames';
import React, { FC } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { pluginSelectors, usePluginStore } from '@/store/plugin';
import type { Plugin } from '@/types/plugin';

import { PluginListTypeEnum } from '../../const';
import Action from './Action';
import Tag from './Tag';

const { Paragraph } = Typography;

interface PluginListProps {
  className?: string;
  searchKeyword?: string;
  type: PluginListTypeEnum;
}

const useStyles = createStyles(({ css, token }) => ({
  pluginItem: css`
    display: flex;
    align-items: center;
    justify-content: space-between;

    height: 58px;

    border-bottom: 1px solid #e8e8e8;
  `,
  avatar: css`
    min-width: 36px;
  `,
  content: css`
    overflow: hidden;
    flex: 1;
    margin: 0 12px;
  `,
  titleContainer: css`
    display: flex;
    align-items: center;
  `,
  title: css`
    margin-bottom: 0 !important;
    font-weight: 500;
  `,
  description: css`
    margin-bottom: 0 !important;
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextTertiary};
  `,
  action: css`
    flex: none;
    margin-left: auto;
  `,
}));

const PluginList: FC<PluginListProps> = (props) => {
  const { type, searchKeyword, className } = props;
  const { styles } = useStyles();

  const [allPlugins, installedPlugins] = usePluginStore((s) => [
    pluginSelectors.getAllPlugins(s),
    pluginSelectors.getInstalledPlugins(s),
  ]);

  const listData = (type === PluginListTypeEnum.Installed ? installedPlugins : allPlugins).filter(
    (plugin) => {
      const { meta, author } = plugin;

      if (!searchKeyword) return true;

      const keyword = searchKeyword.toLowerCase();

      return [meta.title, meta.description, author]
        .map((str) => str?.toLowerCase())
        .some((str) => str?.includes(keyword));
    },
  );

  const renderPluginItem = (plugin: Plugin) => {
    return (
      <div className={styles.pluginItem}>
        <Avatar src={plugin.meta.avatar} className={styles.avatar} />
        <div className={styles.content}>
          <div className={styles.titleContainer}>
            <Paragraph className={styles.title} ellipsis={{ tooltip: true }}>
              {plugin.meta.title}
            </Paragraph>
            <Tag {...plugin} />
          </div>
          <Paragraph className={styles.description} ellipsis={{ tooltip: true }}>
            {plugin.meta.description}
          </Paragraph>
        </div>
        <div className={styles.action}>
          <Action identifier={plugin.identifier} />
        </div>
      </div>
    );
  };

  return (
    <Virtuoso
      computeItemKey={(_, item) => item.identifier}
      className={classNames(className)}
      data={listData}
      itemContent={(_, plugin) => {
        return renderPluginItem(plugin);
      }}
    />
  );
};

PluginList.displayName = 'PluginList';

export default PluginList;
