import { createStyles } from 'antd-style';
import React, { FC } from 'react';

interface ApiTableProps {
  identifier?: string;
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

const ApiTable: FC<ApiTableProps> = () => {
  const { styles } = useStyles();
  return <div className={styles.container}></div>;
};
ApiTable.displayName = 'ApiTable';

export default ApiTable;
