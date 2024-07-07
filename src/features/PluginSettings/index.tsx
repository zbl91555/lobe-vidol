import { PluginSchema } from '@lobehub/chat-plugin-sdk';
import { Form, Markdown } from '@lobehub/ui';
import { Form as AForm } from 'antd';
import { createStyles } from 'antd-style';
import { FC } from 'react';
import useMergeState from 'use-merge-value';


import PluginSettingRender from './PluginSettingRender';

export const transformPluginSettings = (pluginSettings?: PluginSchema) => {
  if (!pluginSettings?.properties) return [];

  return Object.entries(pluginSettings.properties).map(([name, i]) => ({
    desc: i.description,
    enum: i.enum,
    format: i.format,
    label: i.title || name,
    maximum: i.maximum,
    minimum: i.minimum,
    name,
    tag: name,
    type: i.type,
  }));
};

interface PluginSettingsProps {
  onChange?: (value: Record<string, any>) => void;
  schema?: PluginSchema;
  value?: Record<string, any>;
}

const useStyles = createStyles(({ css, token }) => ({
  markdown: css`
    p {
      color: ${token.colorTextDescription};
    }
  `,
}));
const PluginSettings: FC<PluginSettingsProps> = (props) => {
  const { schema } = props;
  const { styles } = useStyles();

  const [form] = AForm.useForm();
  const [settingsValue, setSettingsValue] = useMergeState({}, props);
  const items = transformPluginSettings(schema);

  if (!items.length) return null;

  return (
    <Form form={form} layout={'vertical'} style={{ width: '100%' }} initialValues={settingsValue}>
      {items.map((item) => (
        <Form.Item
          desc={
            item.desc && (
              <Markdown className={styles.markdown} variant={'chat'}>
                {item.desc as string}
              </Markdown>
            )
          }
          key={item.label}
          label={item.label}
          tag={item.tag}
        >
          <PluginSettingRender
            defaultValue={settingsValue[item.name]}
            enum={item.enum}
            format={item.format}
            maximum={item.maximum}
            minimum={item.minimum}
            onChange={(value) => {
              setSettingsValue({ [item.name]: value });
            }}
            type={item.type as any}
          />
        </Form.Item>
      ))}
    </Form>
  );
};
PluginSettings.displayName = 'PluginSettings';

export default PluginSettings;
