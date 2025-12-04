import { createContext, useContext, useState, useEffect } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [currentView, setCurrentView] = useState('home');

    // App Data
    const [modelImage, setModelImage] = useState(null);
    const [shirtImage, setShirtImage] = useState(null);
    const [generatedVideo, setGeneratedVideo] = useState(null);

    // Auth State
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // User Management State (Mock Backend)
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('app_users');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('app_users', JSON.stringify(users));
    }, [users]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const login = (userData) => {
        const email = userData.email.toLowerCase();

        // Always refresh users from localStorage to handle multi-tab/window updates
        const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
        // Update state if different (optional, but good for consistency)
        if (JSON.stringify(storedUsers) !== JSON.stringify(users)) {
            setUsers(storedUsers);
        }

        let currentUser = storedUsers.find(u => u.email.toLowerCase() === email);

        if (!currentUser) {
            // New User Registration
            currentUser = {
                ...userData,
                email: email,
                isAdmin: email === 'mueezzakir6@gmail.com', // Hardcoded Admin
                joinedAt: new Date().toISOString()
            };
            const newUsers = [...storedUsers, currentUser];
            setUsers(newUsers);
            localStorage.setItem('app_users', JSON.stringify(newUsers));
        } else {
            // Existing User - Update details if needed, but keep admin status
            // Ensure hardcoded admin is always admin
            if (email === 'mueezzakir6@gmail.com' && !currentUser.isAdmin) {
                currentUser.isAdmin = true;
                const updatedUsers = storedUsers.map(u => u.email === email ? { ...u, isAdmin: true } : u);
                setUsers(updatedUsers);
                localStorage.setItem('app_users', JSON.stringify(updatedUsers));
            }
        }

        setUser(currentUser);
        setIsAuthenticated(true);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setCurrentView('home'); // Reset view on logout
    };

    const toggleAdmin = (targetEmail) => {
        if (!user || !user.isAdmin) return; // Only admins can toggle

        setUsers(prev => prev.map(u => {
            if (u.email.toLowerCase() === targetEmail.toLowerCase()) {
                return { ...u, isAdmin: !u.isAdmin };
            }
            return u;
        }));
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Project State
    const [activeProject, setActiveProject] = useState(() => {
        const saved = localStorage.getItem('active_project');
        return saved ? JSON.parse(saved) : null;
    });

    const [allProjects, setAllProjects] = useState(() => {
        const saved = localStorage.getItem('work_projects');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        if (activeProject) {
            localStorage.setItem('active_project', JSON.stringify(activeProject));
        } else {
            localStorage.removeItem('active_project');
        }
    }, [activeProject]);

    useEffect(() => {
        localStorage.setItem('work_projects', JSON.stringify(allProjects));
    }, [allProjects]);

    const createProject = (details) => {
        const newProject = {
            ...details,
            status: 'active',
            steps: {
                model: 'pending',
                texture: 'pending',
                garment: 'pending'
            },
            files: {
                model: null,
                shirt: null,
                garment: null
            },
            date: new Date().toISOString()
        };
        setActiveProject(newProject);
        setAllProjects(prev => [newProject, ...prev]);
        return newProject;
    };

    const updateProjectAsset = (type, url, description = '') => {
        if (!activeProject) return;

        setActiveProject(prev => {
            const updated = {
                ...prev,
                steps: {
                    ...prev.steps,
                    [type]: 'done'
                },
                files: {
                    ...prev.files,
                    [type]: url
                },
                // Update description if provided (e.g. from prompt)
                [`${type}Desc`]: description ? `${prev.id} ${description}` : prev[`${type}Desc`]
            };

            // Also update in allProjects list
            setAllProjects(all => all.map(p => p.id === updated.id ? updated : p));

            return updated;
        });
    };

    const cancelProject = () => {
        setActiveProject(null);
    };

    const deleteProject = (id) => {
        setAllProjects(prev => prev.filter(p => p.id !== id));
        if (activeProject && activeProject.id === id) {
            setActiveProject(null);
        }
    };

    const resumeProject = (project) => {
        setActiveProject(project);
        setCurrentView('home'); // Go to dashboard to see active status
    };

    const editProject = (id, updatedDetails) => {
        setAllProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedDetails } : p));
        if (activeProject && activeProject.id === id) {
            setActiveProject(prev => ({ ...prev, ...updatedDetails }));
        }
    };

    // Orders State (for Brandies)
    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('brandies_orders');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('brandies_orders', JSON.stringify(orders));
    }, [orders]);

    const [unreadNotifications, setUnreadNotifications] = useState(() => {
        return orders.filter(order => order.read === false).length;
    });

    // Update unread count when orders change (specifically for new orders)
    useEffect(() => {
        setUnreadNotifications(orders.filter(order => order.read === false).length);
    }, [orders]);

    const addOrder = (orderData) => {
        const newOrder = {
            id: `ORD-${Date.now()}`,
            date: new Date().toISOString(),
            status: 'Pending',
            read: false,
            ...orderData
        };
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
    };

    const markNotificationsAsRead = () => {
        setOrders(prev => prev.map(order => ({ ...order, read: true })));
        setUnreadNotifications(0);
    };

    const updateOrderStatus = (id, status, additionalData = {}) => {
        setOrders(prev => prev.map(order =>
            order.id === id ? { ...order, status, ...additionalData } : order
        ));
    };

    const deleteOrder = (id) => {
        setOrders(prev => prev.filter(order => order.id !== id));
    };

    return (
        <GlobalContext.Provider value={{
            theme,
            toggleTheme,
            currentView,
            setCurrentView,
            modelImage,
            setModelImage,
            shirtImage,
            setShirtImage,
            generatedVideo,
            setGeneratedVideo,
            user,
            isAuthenticated,
            login,
            logout,
            activeProject,
            createProject,
            updateProjectAsset,
            cancelProject,
            deleteProject,
            resumeProject,
            editProject,
            editProject,
            allProjects,
            orders,
            addOrder,
            addOrder,
            updateOrderStatus,
            deleteOrder,
            unreadNotifications,
            unreadNotifications,
            markNotificationsAsRead,
            users,
            toggleAdmin
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => useContext(GlobalContext);
