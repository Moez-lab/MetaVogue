import { useState } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { Icon } from '../../components/Icon';

export const AdminUsersView = () => {
    const { users, toggleAdmin, resetPassword, deleteUser, user, allProjects, editProject, orders, updateOrderStatus } = useGlobal();
    const [assigningTo, setAssigningTo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Unify Orders and Projects into a single assignable list
    const assignableItems = [
        ...allProjects.map(p => ({
            type: 'project',
            id: p.id,
            name: p.company || 'Unknown Project',
            date: p.date,
            assignedTo: p.assignedAdminEmail || null
        })),
        ...orders.map(o => ({
            type: 'order',
            id: o.id,
            name: o.brandName || 'Unknown Order',
            date: o.date,
            assignedTo: o.assignedAdminEmail || null
        }))
    ];

    const availableItems = assignableItems.filter(item => {
        const searchLow = searchTerm.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(searchLow);
        const matchesName = item.name.toLowerCase().includes(searchLow);
        
        // Match Date (e.g., "4/7", "2026")
        const dateStr = item.date ? new Date(item.date).toLocaleDateString().toLowerCase() : '';
        const matchesDate = dateStr.includes(searchLow);
        
        return matchesId || matchesName || matchesDate;
    });

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
                                <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-wider">Assignments</th>
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
                                    <td className="p-4">
                                        {u.isAdmin ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-white">
                                                        {allProjects.filter(p => p.assignedAdminEmail === u.email).length + orders.filter(o => o.assignedAdminEmail === u.email).length} Tasks
                                                    </span>
                                                </div>
                                                
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setAssigningTo(assigningTo === u.email ? null : u.email)}
                                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
                                                        title="Assign Project"
                                                    >
                                                        <Icon name="Plus" size={12} />
                                                    </button>

                                                    {assigningTo === u.email && (
                                                        <div className="absolute top-full left-0 mt-2 w-64 bg-[#1c2128] border border-white/10 rounded-xl shadow-2xl z-50 p-3 animate-fade-in">
                                                            <input 
                                                                type="text" 
                                                                placeholder="Search projects..." 
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white mb-2 focus:ring-1 focus:ring-primary outline-none"
                                                            />
                                                            <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                                                                {availableItems.length > 0 ? (
                                                                    availableItems.map(item => (
                                                                        <button
                                                                            key={item.id}
                                                                            onClick={() => {
                                                                                if (item.type === 'project') {
                                                                                    editProject(item.id, { assignedAdminEmail: u.email });
                                                                                } else {
                                                                                    updateOrderStatus(item.id, orders.find(o => o.id === item.id)?.status || 'Pending', { assignedAdminEmail: u.email });
                                                                                }
                                                                                setAssigningTo(null);
                                                                                setSearchTerm('');
                                                                            }}
                                                                            className={`w-full text-left p-2 rounded-lg transition-colors group/item relative overflow-hidden ${item.assignedTo === u.email ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/10'}`}
                                                                        >
                                                                            <div className="flex justify-between items-center mb-1">
                                                                                <div className="text-xs font-bold text-white group-hover/item:text-primary">{item.name}</div>
                                                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${item.type === 'order' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                                                    {item.type}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-[10px] text-white/40">
                                                                                <span>{item.id}</span>
                                                                                <span>{item.date ? new Date(item.date).toLocaleDateString() : ''}</span>
                                                                            </div>
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-[10px] text-white/30 text-center py-2">No items found</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-white/20 italic">No privileges</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        {u.email === user.email ? (
                                            <span className="text-xs text-white/30 italic mr-2">Current User</span>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Reset password for ${u.email} to "Password123"?`)) {
                                                            resetPassword(u.email);
                                                        }
                                                    }}
                                                    className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                                                    title="Reset Password"
                                                >
                                                    <Icon name="Key" size={14} />
                                                </button>
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
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Are you sure you want to PERMANENTLY delete user ${u.email}?`)) {
                                                            deleteUser(u.email);
                                                        }
                                                    }}
                                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                                                    title="Delete User"
                                                >
                                                    <Icon name="Trash" size={14} />
                                                </button>
                                            </div>
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
