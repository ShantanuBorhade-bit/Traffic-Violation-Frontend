import { useState } from 'react';
import EmptyState from '../../components/EmptyState';
import { Users, Search, User } from 'lucide-react';

const ROLE_STYLES = {
  CITIZEN: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300',
  TRAFFIC_OFFICER: 'bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300',
  GRIEVANCE_OFFICER: 'bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300',
  ADMIN: 'bg-danger-100 dark:bg-danger-900/40 text-danger-700 dark:text-danger-300',
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const users = [];

  const filtered = users
    .filter((u) => roleFilter === 'ALL' || u.role === roleFilter)
    .filter(
      (u) =>
        !search ||
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage user accounts and roles</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" className="input pl-10" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="ALL">All Roles</option>
          <option value="CITIZEN">Citizen</option>
          <option value="TRAFFIC_OFFICER">Traffic Officer</option>
          <option value="GRIEVANCE_OFFICER">Grievance Officer</option>
          <option value="ADMIN">Administrator</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="User management will be available when the admin API endpoints are connected." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[u.role]}`}>
                        {u.role?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{u.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
