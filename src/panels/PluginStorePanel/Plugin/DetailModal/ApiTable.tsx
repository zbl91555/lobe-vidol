import { Empty, Table } from 'antd';
import React, { FC } from 'react';
import { Flexbox } from 'react-layout-kit';

import { pluginSelectors, usePluginStore } from '@/store/plugin';

interface ApiTableProps {
  identifier: string;
}

const ApiTable: FC<ApiTableProps> = (props) => {
  const { identifier } = props;

  const plugin = usePluginStore(pluginSelectors.getPluginById(identifier));

  const pluginManifest = plugin?.pluginManifest;

  if (!pluginManifest?.api) return <Empty />;

  return (
    <Flexbox paddingBlock={16} width={'100%'}>
      <Table
        bordered
        columns={[
          {
            dataIndex: 'name',
            render: (name: string) => <code>{name}</code>,
            title: 'API 名称',
          },
          {
            dataIndex: 'description',
            title: 'API 描述',
          },
        ]}
        dataSource={pluginManifest.api}
        pagination={false}
        rowKey={'name'}
        size={'small'}
        tableLayout="fixed"
      />
    </Flexbox>
  );
};
ApiTable.displayName = 'ApiTable';

export default ApiTable;
