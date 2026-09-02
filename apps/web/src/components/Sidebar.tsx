import { NavLink, useParams } from 'react-router-dom';
import {
  Activity,
  FolderTree,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  CircleDot,
  LayoutDashboard,
  Map,
  Package,
  Settings as SettingsIcon,
  Tag,
  Users,
} from 'lucide-react';
import { cn } from '@repolens/ui';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

export function Sidebar() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const base = `/${owner}/${repo}`;

  const items: NavItem[] = [
    { label: 'Overview', to: base, icon: LayoutDashboard, end: true },
    { label: 'Repository Map', to: `${base}/map`, icon: Map },
    { label: 'Files', to: `${base}/files`, icon: FolderTree },
    { label: 'Commits', to: `${base}/commits`, icon: GitCommitHorizontal },
    { label: 'Branches', to: `${base}/branches`, icon: GitBranch },
    { label: 'Contributors', to: `${base}/contributors`, icon: Users },
    { label: 'Dependencies', to: `${base}/dependencies`, icon: Package },
    { label: 'Activity', to: `${base}/activity`, icon: Activity },
    { label: 'Pull Requests', to: `${base}/pulls`, icon: GitPullRequest },
    { label: 'Issues', to: `${base}/issues`, icon: CircleDot },
    { label: 'Releases', to: `${base}/releases`, icon: Tag },
  ];

  return (
    <nav className="flex h-full w-52 shrink-0 flex-col justify-between border-r border-rule bg-surface-1 py-2">
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 border-l-2 py-1 pl-3 pr-2 font-collar text-sm',
                  isActive
                    ? 'border-signal bg-signal/10 text-text-primary'
                    : 'border-transparent text-text-secondary hover:bg-surface-2',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-3.5 w-3.5 shrink-0',
                      isActive ? 'text-signal-ink' : 'text-structure',
                    )}
                    strokeWidth={1.75}
                  />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
      <ul className="flex flex-col border-t border-rule pt-2">
        <li>
          <NavLink
            to={`${base}/settings`}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 border-l-2 py-1 pl-3 pr-2 font-collar text-sm',
                isActive
                  ? 'border-signal bg-signal/10 text-text-primary'
                  : 'border-transparent text-text-secondary hover:bg-surface-2',
              )
            }
          >
            {({ isActive }) => (
              <>
                <SettingsIcon
                  className={cn(
                    'h-3.5 w-3.5 shrink-0',
                    isActive ? 'text-signal-ink' : 'text-structure',
                  )}
                  strokeWidth={1.75}
                />
                <span>Settings</span>
              </>
            )}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
