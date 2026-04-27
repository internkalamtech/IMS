import { AuthRepositoryImpl } from '@/data/repositories/auth-repository-impl';
import { DemoCredential } from '@/domain/entities/demo-credential';
import { User } from '@/domain/entities/user';
import { GetDemoCredentialsUseCase } from '@/domain/usecases/get-demo-credentials-usecase';
import { LoginUseCase } from '@/domain/usecases/login-usecase';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    demoCredentials: DemoCredential[];
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchDemoCredentials: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dependency injection
const authRepository = new AuthRepositoryImpl();
const loginUseCase = new LoginUseCase(authRepository);
const getDemoCredentialsUseCase = new GetDemoCredentialsUseCase(authRepository);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [demoCredentials, setDemoCredentials] = useState<DemoCredential[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkUser();
        fetchDemoCredentials();
    }, []);

    const checkUser = async () => {
        try {
            const currentUser = await authRepository.getCurrentUser();
            setUser(currentUser);
        } catch {
            // Ignore error when checking current user
        } finally {
            setLoading(false);
        }
    };

    const fetchDemoCredentials = async () => {
        try {
            const creds = await getDemoCredentialsUseCase.execute();
            setDemoCredentials(creds);
        } catch (e) {
            console.error('Failed to fetch demo credentials', e);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const loggedInUser = await loginUseCase.execute(email, password);
            setUser(loggedInUser);
        } catch (e: any) {
            setError(e.message || 'Login failed');
             throw e; // Rethrow to allow component to handle it if needed
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authRepository.logout();
            setUser(null);
        } catch (e: any) {
            setError(e.message || 'Logout failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                demoCredentials,
                loading,
                error,
                login,
                logout,
                fetchDemoCredentials,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
