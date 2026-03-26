import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  FolderOpen,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { path: '/contacts', icon: Users, label: 'Contacts' },
  { path: '/groups', icon: FolderOpen, label: 'Groups' },
  { path: '/inbox', icon: MessageSquare, label: 'Inbox' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-72 border-r border-[#decfbe] bg-[#f7efe5] lg:flex lg:flex-col">
      <div className="border-b border-[#decfbe] px-6 py-6">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[#1f172f]">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <span className="block font-['Outfit'] text-lg font-semibold text-[#1f172f]">
              CampaignHub
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-[#8a6270]">
              Workspace
            </span>
          </div>
        </NavLink>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <p className="px-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8c8393]">
          Navigation
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const NavIcon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `mt-1.5 flex items-center gap-3 rounded-[1rem] border px-4 py-3 font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-[#d9ccb9] bg-[#fffdf9] text-[#1f172f]'
                      : 'border-transparent text-[#6f677b] hover:bg-[#fff8f0] hover:text-[#1f172f]'
                    }`
                  }
                >
                  <NavIcon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#decfbe] p-4">
        <div className="mb-2 flex items-center gap-3 rounded-[1rem] border border-[#d9ccb9] bg-[#fffdf9] px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efe5d8] font-semibold text-[#1f172f]">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1f172f] truncate">{user?.name || 'User'}</p>
            <p className="text-sm text-[#6f677b] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[1rem] px-4 py-3 text-[#6f677b] transition-all duration-200 hover:bg-[#fff8f0] hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
