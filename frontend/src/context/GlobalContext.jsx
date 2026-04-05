import { createContext, useContext, useState, useEffect } from 'react';
import {
    loginUser, fetchUsers, toggleUserAdmin, resetUserPassword,
    fetchProjects, createProjectDB, updateProjectDB, deleteProjectDB,
    fetchOrders, createOrderDB, updateOrderDB, deleteOrderDB, addOrderCommentDB
} from '../services/api';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [currentView, setCurrentView] = useState('home');

    // App Data
    const [modelImage, setModelImage] = useState(null);
    const [shirtImage, setShirtImage] = useState(null);
    const [generatedVideo, setGeneratedVideo] = useState(null);

    // Auth State
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user_profile');
        return saved ? JSON.parse(saved) : null;
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [users, setUsers] = useState([]);

    // Projects State
    const [allProjects, setAllProjects] = useState([]);
    const [activeProject, setActiveProject] = useState(() => {
        const saved = localStorage.getItem('active_project');
        return saved ? JSON.parse(saved) : null;
    });

    // Orders State
    const [orders, setOrders] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    // Fetch initial DB data
    const loadDBData = async () => {
        try {
            const [usersData, projectsData, ordersData] = await Promise.all([
                fetchUsers().catch(() => []),
                fetchProjects().catch(() => []),
                fetchOrders().catch(() => [])
            ]);
            setUsers(Array.isArray(usersData) ? usersData : []);
            setAllProjects(Array.isArray(projectsData) ? projectsData : []);
            setOrders(Array.isArray(ordersData) ? ordersData : []);
        } catch (error) {
            console.error("Failed to sync DB:", error);
        }
    };

    useEffect(() => {
        // Load data on startup if logged in
        if (isAuthenticated) {
            loadDBData();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (activeProject) localStorage.setItem('active_project', JSON.stringify(activeProject));
        else localStorage.removeItem('active_project');
    }, [activeProject]);

    useEffect(() => {
        if (user) localStorage.setItem('user_profile', JSON.stringify(user));
        else localStorage.removeItem('user_profile');
    }, [user]);

    useEffect(() => {
        setUnreadNotifications(orders.filter(order => order.read === false).length);
    }, [orders]);

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    // ================== AUTH ==================
    const login = async (userData) => {
        try {
            // Send to backend (creates user if doesn't exist, else logs in)
            const res = await loginUser(userData.email, userData.password, userData.name || 'User');
            localStorage.setItem('token', res.token);
            setUser(res.user);
            setIsAuthenticated(true);
            await loadDBData(); // Sync DB right after login
            return res.user;
        } catch (error) {
            console.error("Login failed:", error);
            // Fallback for UI if backend is down while testing
            alert(`Backend Login Failed: Ensure the Docker DB and backend server are running on port 3001.\nError: ${error.message}`);
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setCurrentView('home');
        localStorage.removeItem('token');
        localStorage.removeItem('user_profile');
        setAllProjects([]);
        setOrders([]);
    };

    const toggleAdmin = async (targetEmail) => {
        if (!user || !user.isAdmin) return;
        try {
            const res = await toggleUserAdmin(targetEmail);
            setUsers(prev => prev.map(u => u.email === targetEmail ? { ...u, isAdmin: res.isAdmin } : u));
        } catch (err) {
            console.error("Toggle admin failed:", err);
        }
    };

    const resetPassword = async (targetEmail) => {
        if (!user || !user.isAdmin) return;
        try {
            await resetUserPassword(targetEmail);
            alert(`Password for ${targetEmail} has been reset to "Password123"`);
        } catch (err) {
            console.error("Reset password failed:", err);
            alert(`Failed to reset password: ${err.message}`);
        }
    };

    // ================== PROJECTS ==================
    const createProject = async (details) => {
        const newProject = {
            id: `PRJ-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            userEmail: user?.email || 'guest',
            status: 'active',
            steps: { model: 'pending', texture: 'pending', garment: 'pending' },
            date: new Date().toISOString(),
            ...details,
            files: { model: null, shirt: null, garment: null, ...(details.files || {}) }
        };

        // Optimistic UI update
        setActiveProject(newProject);
        setAllProjects(prev => [newProject, ...prev]);

        try {
            await createProjectDB(newProject);
        } catch (err) {
            console.error("Failed to save project to DB:", err);
        }
        return newProject;
    };

    const updateProjectAsset = async (type, url, description = '') => {
        if (!activeProject) return;

        let updatedProject = null;
        setActiveProject(prev => {
            updatedProject = {
                ...prev,
                steps: { ...prev.steps, [type]: 'done' },
                files: { ...prev.files, [type]: url },
                [`${type}Desc`]: description ? `${prev.id} ${description}` : prev[`${type}Desc`]
            };
            return updatedProject;
        });

        // Also update in allProjects list
        setAllProjects(all => all.map(p => p.id === activeProject.id ? updatedProject : p));

        try {
            await updateProjectDB(activeProject.id, updatedProject);
        } catch (err) {
            console.error("Failed to update project asset in DB:", err);
        }
    };

    const editProject = async (id, updatedDetails) => {
        setAllProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedDetails } : p));
        if (activeProject && activeProject.id === id) {
            setActiveProject(prev => ({ ...prev, ...updatedDetails }));
        }

        try {
            await updateProjectDB(id, updatedDetails);
        } catch (err) {
            console.error("Failed to edit project DB:", err);
        }
    };

    const deleteProject = async (id) => {
        setAllProjects(prev => prev.filter(p => p.id !== id));
        if (activeProject && activeProject.id === id) setActiveProject(null);

        try {
            await deleteProjectDB(id);
        } catch (err) {
            console.error("Failed to delete project DB:", err);
        }
    };

    const cancelProject = () => setActiveProject(null);
    const resumeProject = (project) => setActiveProject(project);

    // ================== ORDERS ==================
    const addOrder = async (orderData) => {
        const newOrder = {
            id: `ORD-${Date.now()}`,
            brandEmail: user?.email || 'guest',
            date: new Date().toISOString(),
            status: 'Pending',
            paymentStatus: 'Unpaid',
            read: false,
            comments: [],
            ...orderData
        };

        setOrders(prev => [newOrder, ...prev]);

        try {
            await createOrderDB(newOrder);
        } catch (err) {
            console.error("Failed to save order to DB:", err);
        }
        return newOrder;
    };

    const markNotificationsAsRead = async () => {
        const unread = orders.filter(o => !o.read);
        setOrders(prev => prev.map(order => ({ ...order, read: true })));
        setUnreadNotifications(0);

        try {
            await Promise.all(unread.map(o => updateOrderDB(o.id, { read: true })));
        } catch (err) {
            console.error("Failed to clear DB unread notifications:", err);
        }
    };

    const updateOrderStatus = async (id, status, additionalData = {}) => {
        const updates = { status, ...additionalData };
        setOrders(prev => prev.map(order => order.id === id ? { ...order, ...updates } : order));

        try {
            await updateOrderDB(id, updates);
        } catch (err) {
            console.error("Failed to update DB Order Status:", err);
        }
    };

    const deleteOrder = async (id) => {
        setOrders(prev => prev.filter(order => order.id !== id));
        try {
            await deleteOrderDB(id);
        } catch (err) {
            console.error("Failed to delete DB Order:", err);
        }
    };

    const addOrderComment = async (orderId, comment) => {
        const newComment = { id: `CMT-${Date.now()}`, date: new Date().toISOString(), ...comment };
        
        setOrders(prev => prev.map(order => {
            if (order.id === orderId) {
                return { ...order, comments: [...(order.comments || []), newComment] };
            }
            return order;
        }));

        try {
            await addOrderCommentDB(orderId, newComment);
        } catch (err) {
            console.error("Failed to push comment to DB:", err);
        }
    };

    return (
        <GlobalContext.Provider value={{
            theme, toggleTheme, currentView, setCurrentView,
            modelImage, setModelImage, shirtImage, setShirtImage, generatedVideo, setGeneratedVideo,
            user, isAuthenticated, login, logout, users, toggleAdmin, resetPassword,
            activeProject, createProject, updateProjectAsset, cancelProject, deleteProject, resumeProject, editProject, allProjects,
            orders, addOrder, updateOrderStatus, deleteOrder, addOrderComment, unreadNotifications, markNotificationsAsRead
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => useContext(GlobalContext);
