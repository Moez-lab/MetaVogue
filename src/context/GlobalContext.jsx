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

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setCurrentView('home'); // Reset view on logout
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

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
            logout
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => useContext(GlobalContext);
