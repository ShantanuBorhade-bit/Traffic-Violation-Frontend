import { useState, useEffect } from 'react';
import { adminUserAPI } from '../../api/client';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { Users, Search, User, Plus, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const ROLE_STYLES = {
  CITIZEN: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300',
  TRAFFIC_OFFICER: 'bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300',
  GRIEVANCE_OFFICER: 'bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300',
  ADMIN: 'bg-danger-100 dark:bg-danger-900/40 text-danger-700 dark:text-danger-300',
};

const OFFICER_ROLES = [
  { value: 'TRAFFIC_OFFICER', label: 'Traffic Officer', desc: 'Can upload manual violations from the field', icon: '👮' },
  { value: 'GRIEVANCE_OFFICER', label: 'Grievance Officer', desc: 'Can review and resolve citizen grievances', icon: '📋' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ fullName: '', email: '', password: '', role: 'TRAFFIC_OFFICER' });
  const [showPassword, setShowPassword] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await adminUserAPI.list();
      setUsers(res.data.users || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      await adminUserAPI.create(createForm);
      setCreateSuccess(true);
      setCreateForm({ fullName: '', email: '', password: '', role: 'TRAFFIC_OFFICER' });
      fetchUsers(); // refresh list
      setTimeout(() => { setShowCreateModal(false); setCreateSuccess(false); }, 1500);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create account');
    } finally { setCreateLoading(false); }
  };

  const filtered = users
    .filter(u => roleFilter === 'ALL' || u.role === roleFilter)
    .filter(u => !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage user accounts and create officer accounts</p>
        </div>
        <button onClick={() => { setShowCreateModal(true); setCreateError(''); setCreateSuccess(false); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Create Officer
        </button>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {['CITIZEN', 'TRAFFIC_OFFICER', 'GRIEVANCE_OFFICER', 'ADMIN'].map(role => (
          <div key={role} className="card p-4 flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[role]}`}>
              {role.replace(/_/g, ' ')}
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white ml-auto">
              {users.filter(u => u.role === role).length}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" className="input pl-10" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="ALL">All Roles</option>
          <option value="CITIZEN">Citizen</option>
          <option value="TRAFFIC_OFFICER">Traffic Officer</option>
          <option value="GRIEVANCE_OFFICER">Grievance Officer</option>
          <option value="ADMIN">Administrator</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="No users match your search criteria." />
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
                {filtered.map(u => (
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

      {/* Create Officer Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setCreateError(''); setCreateSuccess(false); }} title="Create Officer Account">
        {createSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-10 w-10 text-success-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Account created successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleCreateUser} className="space-y-4">
            {createError && (
              <div className="p-2 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-400 text-sm rounded-lg">
                {createError}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="input-label">Officer Role *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {OFFICER_ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => setCreateForm(prev => ({ ...prev, role: r.value }))}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${createForm.role === r.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                    <span className="text-lg">{r.icon}</span>
                    <span className={`block text-sm font-medium mt-1 ${createForm.role === r.value ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>{r.label}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Full Name *</label>
              <input type="text" className="input" placeholder="Officer name" value={createForm.fullName} onChange={e => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))} required />
            </div>

            <div>
              <label className="input-label">Email *</label>
              <input type="email" className="input" placeholder="officer@example.com" value={createForm.email} onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))} required />
            </div>

            <div>
              <label className="input-label">Password *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input pr-10" placeholder="Min 6 characters" value={createForm.password} onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))} required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => { setShowCreateModal(false); setCreateError(''); }} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={createLoading || !createForm.fullName || !createForm.email || !createForm.password} className="btn-primary">
                {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Account
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
