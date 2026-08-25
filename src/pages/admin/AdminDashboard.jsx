import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  FileWarning,
  AlertCircle,
  BadgeCheck,
  Shield,
  ArrowRight,
  Activity,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  const QUICK_ACTIONS = [
    {
      to: '/admin/violations',
      icon: FileWarning,
      label: 'Violations',
      description: 'View and manage all traffic violations detected by the system',
      color: 'bg-danger-50 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400',
    },
    {
      to: '/admin/challans',
      icon: BadgeCheck,
      label: 'Challans',
      description: 'Track and manage all issued challans and payment statuses',
      color: 'bg-warning-50 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
    },
    {
      to: '/admin/grievances',
      icon: AlertCircle,
      label: 'Grievances',
      description: 'Review and resolve citizen-submitted grievances',
      color: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    },
    {
      to: '/admin/users',
      icon: Users,
      label: 'Users',
      description: 'Manage user accounts and role assignments',
      color: 'bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Welcome, {user?.fullName}. Manage the traffic violation system.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="card-hover p-5 flex items-start gap-4"
            >
              <div className={`p-3 rounded-xl ${action.color}`}>
                <action.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                  {action.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{action.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0 mt-2" />
            </Link>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          System Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <Shield className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">System</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                TrafficGuard v1.0
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <Activity className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">ML Pipeline</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Active</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Detection Model</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">v2.1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
