import { Button, Layout } from 'antd';
import { ArrowLeftOutlined, ThunderboltOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/widgets/theme-toggle/ui/theme-toggle';
import styles from './app-header.module.css';

export type AppHeaderVariant = 'main' | 'back';

interface AppHeaderMainProps {
  variant: 'main';
}

interface AppHeaderBackProps {
  variant: 'back';
  title: string;
  backTo?: string;
}

export type AppHeaderProps = AppHeaderMainProps | AppHeaderBackProps;

export function AppHeader(props: AppHeaderProps) {
  const navigate = useNavigate();

  if (props.variant === 'main') {
    return (
      <Layout.Header className={styles.header}>
        <span className={styles.logo}>AlgoLearn</span>
        <div className={styles.headerRight}>
          <Button
            type="link"
            icon={<ThunderboltOutlined />}
            onClick={() => navigate('/animation')}
            className={styles.navBtn}
          >
            Animation
          </Button>
          <Button
            type="link"
            icon={<NodeIndexOutlined />}
            onClick={() => navigate('/react-flow')}
            className={styles.navBtn}
          >
            React Flow
          </Button>
          <ThemeToggle />
        </div>
      </Layout.Header>
    );
  }

  return (
    <Layout.Header className={styles.header}>
      <div className={styles.headerLeft}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(props.backTo ?? '/')}
          className={styles.backBtn}
        >
          Назад
        </Button>
        <span className={styles.title}>{props.title}</span>
      </div>
      <ThemeToggle />
    </Layout.Header>
  );
}
