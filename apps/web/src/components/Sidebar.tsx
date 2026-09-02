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
  /** Routes with no implementation yet are marked rather than hidden. */
  pending?: boolean;
}

function Row({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          // Transparent edge on every row so the active one doesn't shift text.
          'flex items-center gap-2.5 border-l-2 border-transparent px-3 py-[5px] text-[13px]',
          isActive
            ? 'lit font-medium'
            : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={cn('h-[15px] w-[15px] shrink-0', isActive && 'text-accent')}
            strokeWidth={1.75}
          />
          <span className="truncate">{item.label}</span>
          {item.pending && (
            <span
              className="ml-auto h-1 w-1 shrink-0 rounded-full bg-rule-strong"
              title="Not built yet"
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const base = `/${owner}/${repo}`;

  // Grouped so eleven near-identical rows stop reading as one grey wall.
  const groups: { legend: string; items: NavItem[] }[] = [
    {
      legend: 'Survey',
      items: [
        { label: 'Overview', to: base, icon: LayoutDashboard, end: true },
        { label: 'Repository Map', to: `${base}/map`, icon: Map },
        { label: 'Files', to: `${base}/files`, icon: FolderTree },
      ],
    },
    {
      legend: 'History',
      items: [
        { label: 'Commits', to: `${base}/commits`, icon: GitCommitHorizontal },
        { label: 'Branches', to: `${base}/branches`, icon: GitBranch },
        { label: 'Contributors', to: `${base}/contributors`, icon: Users },
      ],
    },
    {
      legend: 'Traffic',
      items: [
        { label: 'Pull Requests', to: `${base}/pulls`, icon: GitPullRequest, pending: true },
        { label: 'Issues', to: `${base}/issues`, icon: CircleDot, pending: true },
        { label: 'Releases', to: `${base}/releases`, icon: Tag, pending: true },
        { label: 'Dependencies', to: `${base}/dependencies`, icon: Package, pending: true },
        { label: 'Activity', to: `${base}/activity`, icon: Activity, pending: true },
      ],
    },
  ];

  return (
    <nav className="flex h-full w-[196px] shrink-0 flex-col justify-between border-r border-rule bg-surface-1">
      <div className="flex flex-col gap-4 overflow-y-auto py-3">
        {groups.map((group) => (
          <div key={group.legend} className="flex flex-col">
            <p className="legend px-3 pb-1.5">{group.legend}</p>
            {group.items.map((item) => (
              <Row key={item.to} item={item} />
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-rule py-2">
        <Row item={{ label: 'Settings', to: `${base}/settings`, icon: SettingsIcon }} />
      </div>
    </nav>
  );
}
