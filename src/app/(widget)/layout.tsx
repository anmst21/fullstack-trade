import WidgetShell from './widget-shell';

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return <WidgetShell>{children}</WidgetShell>;
}
