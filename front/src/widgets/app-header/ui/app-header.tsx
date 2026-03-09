import { ArrowLeftOutlined, ThunderboltOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/widgets/theme-toggle/ui/theme-toggle';
import { GlassTopbar } from '@/shared/ui';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
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
      <header className={styles.headerShell}>
        <GlassTopbar
          left={<span className={styles.logo}>AlgoLearn</span>}
          center={null}
          right={
            <div className={styles.headerRight}>
              <GlassButton onClick={() => navigate('/animation')}>
                <ThunderboltOutlined />
                <span>Animation</span>
              </GlassButton>
              <GlassButton onClick={() => navigate('/react-flow')}>
                <NodeIndexOutlined />
                <span>React Flow</span>
              </GlassButton>
              <ThemeToggle />
            </div>
          }
        />
      </header>
    );
  }

  return (
    <header className={styles.headerShell}>
      <GlassTopbar
        left={
          <div className={styles.headerLeft}>
            <GlassButton onClick={() => navigate(props.backTo ?? '/')}>
              <ArrowLeftOutlined />
              <span>Назад</span>
            </GlassButton>
          </div>
        }
        center={<span className={styles.title}>{props.title}</span>}
        right={<ThemeToggle />}
      />
    </header>
  );
}
