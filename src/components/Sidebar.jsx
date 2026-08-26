import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  FileWarning,
  AlertCircle,
  Users,
  Settings,
  LogOut,
  BadgeCheck,
  Car,
  Camera,
} from 'lucide-react';
import clsx from 'clsx';

const CITIZEN_NAV = [
  { to: '/citizen', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/citizen/challans', icon: FileWarning, label: 'My Challans' },
  { to: '/citizen/grievances', icon: AlertCircle, label: 'My Grievances' },
];

const TRAFFIC_OFFICER_NAV = [
  { to: '/officer', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/officer/upload', icon: Camera, label: 'Upload Violation' },
  { to: '/officer/uploads', icon: FileWarning, label: 'My Uploads' },
];

const GRIEVANCE_OFFICER_NAV = [
  { to: '/officer', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/officer/grievances', icon: AlertCircle, label: 'Grievances' },
];

const ADMIN_NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/violations', icon: FileWarning, label: 'Violations' },
  { to: '/admin/challans', icon: BadgeCheck, label: 'Challans' },
  { to: '/admin/grievances', icon: AlertCircle, label: 'Grievances' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

const ROLE_NAV = {
  CITIZEN: CITIZEN_NAV,
  TRAFFIC_OFFICER: TRAFFIC_OFFICER_NAV,
  GRIEVANCE_OFFICER: GRIEVANCE_OFFICER_NAV,
  ADMIN: ADMIN_NAV,
};

const ROLE_LABEL = {
  CITIZEN: 'Citizen',
  TRAFFIC_OFFICER: 'Traffic Officer',
  GRIEVANCE_OFFICER: 'Grievance Officer',
  ADMIN: 'Administrator',
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navItems = ROLE_NAV[user?.role] || [];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200 dark:border-slate-700">
          <div className="p-2 bg-primary-600 rounded-xl">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">TrafficGuard</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Violation Management</p>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-lg">
            <Car className="h-3 w-3" />
            {ROLE_LABEL[user?.role]}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-1">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
              )
            }
          >
            <Settings className="h-5 w-5" />
            Profile
          </NavLink>
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 hover:text-danger-700 dark:text-danger-400 transition-colors duration-150 w-full"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
