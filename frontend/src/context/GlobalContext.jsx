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
        try {
            const saved = localStorage.getItem('work_projects');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Failed to parse work_projects", e);
            return [];
        }
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
            status: 'active',
            steps: {
                model: 'pending',
                texture: 'pending',
                garment: 'pending'
            },
            date: new Date().toISOString(),
            ...details, // Spread details later to allow overriding defaults if needed, but we typically want defaults. 
            // Actually, we want details to override defaults if provided, but we want to be careful about nested objects like files.
            files: {
                model: null,
                shirt: null,
                garment: null,
                ...(details.files || {}) // Merge provided files
            }
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
        // Navigation to home is handled by the caller via useNavigate
    };

    const editProject = (id, updatedDetails) => {
        setAllProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedDetails } : p));
        if (activeProject && activeProject.id === id) {
            setActiveProject(prev => ({ ...prev, ...updatedDetails }));
        }
    };

    // Orders State (for Brandies)
    const [orders, setOrders] = useState(() => {
        try {
            const saved = localStorage.getItem('brandies_orders');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Failed to parse brandies_orders", e);
            return [];
        }
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

    const addOrderComment = (orderId, comment) => {
        setOrders(prev => prev.map(order => {
            if (order.id === orderId) {
                const currentComments = order.comments || [];
                return {
                    ...order,
                    comments: [...currentComments, {
                        id: `CMT-${Date.now()}`,
                        date: new Date().toISOString(),
                        ...comment
                    }]
                };
            }
            return order;
        }));
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
            allProjects,
            orders,
            addOrder,
            updateOrderStatus,
            deleteOrder,
            addOrderComment,
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
