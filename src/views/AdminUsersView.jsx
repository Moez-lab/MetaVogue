import { useGlobal } from '../context/GlobalContext';
import { Icon } from '../components/Icon';

export const AdminUsersView = () => {
    const { users, toggleAdmin, user } = useGlobal();

    // Safety check - although route should protect this
    if (!user?.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/50">
                <Icon name="Lock" size={48} className="mb-4 text-red-500" />
                <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Icon name="Users" size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">User Management</h1>
                    <p className="text-white/50">Manage registered users and admin privileges</p>
                </div>
            </div>

            <div className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider">Email</th>
                                <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider">Joined</th>
                                <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((u) => (
                                <tr key={u.email} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-white font-bold border border-white/10">
                                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <span className="font-medium text-white">{u.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-white/70 font-mono text-sm">{u.email}</td>
                                    <td className="p-4 text-white/50 text-sm">
                                        {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        {u.isAdmin ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/20">
                                                <Icon name="Shield" size={12} />
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 text-white/50 border border-white/5">
                                                User
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        {u.email === user.email ? (
                                            <span className="text-xs text-white/30 italic mr-2">Current User</span>
                                        ) : (
                                            <button
                                                onClick={() => toggleAdmin(u.email)}
                                                className={`
                                                    px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border
                                                    ${u.isAdmin
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                                        : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'}
                                                `}
                                            >
                                                {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="p-12 text-center text-white/30">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
};
