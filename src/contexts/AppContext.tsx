import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Membre, Commission, PV, ToastMessage } from '../types';
import { authService } from '../services/auth';
import { storageService } from '../services/storage';

// Types pour le contexte
interface AppState {
  // Authentification
  isAuthenticated: boolean;
  userRole: string | null;
  
  // Données
  membres: Membre[];
  commissions: Commission[];
  pv: PV[];
  
  // UI
  toasts: ToastMessage[];
  isLoading: boolean;
  
  // Navigation
  sidebarOpen: boolean;
}

type AppAction =
  | { type: 'SET_AUTH'; payload: { isAuthenticated: boolean; userRole: string | null } }
  | { type: 'SET_MEMBRES'; payload: Membre[] }
  | { type: 'SET_COMMISSIONS'; payload: Commission[] }
  | { type: 'SET_PV'; payload: PV[] }
  | { type: 'ADD_TOAST'; payload: ToastMessage }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'REFRESH_DATA' };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Actions d'authentification
  login: (code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  
  // Actions de données
  refreshData: () => void;
  
  // Actions UI
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  toggleSidebar: () => void;
}

// État initial
const initialState: AppState = {
  isAuthenticated: false,
  userRole: null,
  membres: [],
  commissions: [],
  pv: [],
  toasts: [],
  isLoading: false,
  sidebarOpen: false
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        userRole: action.payload.userRole
      };
      
    case 'SET_MEMBRES':
      return { ...state, membres: action.payload };
      
    case 'SET_COMMISSIONS':
      return { ...state, commissions: action.payload };
      
    case 'SET_PV':
      return { ...state, pv: action.payload };
      
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload]
      };
      
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
      
    case 'REFRESH_DATA':
      return {
        ...state,
        membres: storageService.getMembres(),
        commissions: storageService.getCommissions(),
        pv: storageService.getPV()
      };
      
    default:
      return state;
  }
}

// Contexte
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Vérification de l'authentification au démarrage
  useEffect(() => {
    const isAuth = authService.isAuthenticated();
    const role = authService.getCurrentRole();
    
    dispatch({
      type: 'SET_AUTH',
      payload: { isAuthenticated: isAuth, userRole: role }
    });

    // Charger les données si authentifié
    if (isAuth) {
      refreshData();
    }
  }, []);

  // Actions d'authentification
  const login = async (code: string): Promise<{ success: boolean; message: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await authService.login({ code });
      
      if (result.success) {
        dispatch({
          type: 'SET_AUTH',
          payload: { isAuthenticated: true, userRole: result.session!.role }
        });
        
        // Charger les données après connexion
        refreshData();
        
        addToast({
          type: 'success',
          title: 'Connexion réussie',
          message: result.message
        });
      } else {
        addToast({
          type: 'error',
          title: 'Erreur de connexion',
          message: result.message
        });
      }
      
      return result;
    } catch (error) {
      const message = 'Erreur technique lors de la connexion';
      addToast({
        type: 'error',
        title: 'Erreur',
        message
      });
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({
      type: 'SET_AUTH',
      payload: { isAuthenticated: false, userRole: null }
    });
    
    // Vider les données
    dispatch({ type: 'SET_MEMBRES', payload: [] });
    dispatch({ type: 'SET_COMMISSIONS', payload: [] });
    dispatch({ type: 'SET_PV', payload: [] });
    
    addToast({
      type: 'info',
      title: 'Déconnexion',
      message: 'Vous avez été déconnecté avec succès'
    });
  };

  // Actions de données
  const refreshData = () => {
    dispatch({ type: 'REFRESH_DATA' });
  };

  // Actions UI
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 5000
    };
    
    dispatch({ type: 'ADD_TOAST', payload: newToast });
    
    // Auto-suppression
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  };

  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    login,
    logout,
    refreshData,
    addToast,
    removeToast,
    toggleSidebar
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Hook pour l'authentification
export function useAuth() {
  const { state, login, logout } = useApp();
  
  return {
    isAuthenticated: state.isAuthenticated,
    userRole: state.userRole,
    login,
    logout
  };
}

// Hook pour les toasts
export function useToast() {
  const { state, addToast, removeToast } = useApp();
  
  return {
    toasts: state.toasts,
    addToast,
    removeToast,
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) => addToast({ type: 'info', title, message })
  };
}

