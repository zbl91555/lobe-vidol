import { Icon, Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { BadgeCheck, CircleUser, Package } from 'lucide-react';
import { rgba } from 'polished';
import React, { FC } from 'react';

import type { Plugin } from '@/types/plugin';

interface PluginTagProps extends Pick<Plugin, 'author' | 'pluginType'> {
  showIcon?: boolean;
  showText?: boolean;
}

const useStyles = createStyles(({ css, token }) => ({
  community: css`
    color: ${rgba(token.colorInfo, 0.75)};
    background: ${token.colorInfoBg};

    &:hover {
      color: ${token.colorInfo};
    }
  `,
  custom: css`
    color: ${rgba(token.colorWarning, 0.75)};
    background: ${token.colorWarningBg};

    &:hover {
      color: ${token.colorWarning};
    }
  `,
  official: css`
    color: ${rgba(token.colorSuccess, 0.75)};
    background: ${token.colorSuccessBg};

    &:hover {
      color: ${token.colorSuccess};
    }
  `,
}));

const PluginTag: FC<PluginTagProps> = (props) => {
  const { pluginType, author, showIcon } = props;
  const { styles, cx } = useStyles();
  const isCustom = pluginType === 'customPlugin';
  const isOfficial = author === 'LobeHub';

  return (
    <Tag
      className={cx(isCustom ? styles.custom : isOfficial ? styles.official : styles.community)}
      icon={showIcon && <Icon icon={isCustom ? Package : isOfficial ? BadgeCheck : CircleUser} />}
    >
      {author}
    </Tag>
  );
};
PluginTag.displayName = 'PluginTag';

export default PluginTag;
