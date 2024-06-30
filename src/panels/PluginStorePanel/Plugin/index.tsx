import { Input, Segmented } from 'antd';
import { createStyles } from 'antd-style';
import classNames from 'classNames';
import React, { FC, useState } from 'react';

import { PluginListTypeEnum } from '../const';
import PluginList from './List';

interface PluginProps {
  className?: string;
}

const useStyles = createStyles(({ css }) => ({
  container: css`
    overflow: hidden;
    display: flex;
    flex-direction: column;

    width: 100%;
    height: 100%;
    padding: 16px;
  `,
  segmented: css`
    flex: none;
    width: 100%;

    .ant-segmented-item {
      width: 50%;
    }
  `,
  toolbar: css`
    display: flex;
    flex: none;
    margin-top: 12px;
  `,

  searchInput: css`
    margin-right: 10px;
  `,

  pluginList: css`
    flex: 1;
    margin-top: 12px;
  `,
}));

const Plugin: FC<PluginProps> = (props) => {
  const { className } = props;
  const { styles } = useStyles();

  const [pluginListType, setPluginListType] = useState<PluginListTypeEnum>(PluginListTypeEnum.All);
  const [searchKeyword, setSearchKeyword] = useState<string>();

  const SegmentedOptions = [
    {
      value: PluginListTypeEnum.All,
      label: '全部',
    },
    {
      value: PluginListTypeEnum.Installed,
      label: '已安装',
    },
  ];

  return (
    <div className={classNames(className, styles.container)}>
      <Segmented
        value={pluginListType}
        options={SegmentedOptions}
        className={styles.segmented}
        onChange={setPluginListType}
      />
      <div className={styles.toolbar}>
        <Input
          className={styles.searchInput}
          value={searchKeyword}
          placeholder="请输入插件名称或关键字"
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        {/* <Button icon={<PackagePlus size={15} />}>自定义插件</Button> */}
      </div>
      <PluginList
        type={pluginListType}
        searchKeyword={searchKeyword}
        className={styles.pluginList}
      />
    </div>
  );
};
Plugin.displayName = 'Plugin';

export default Plugin;
