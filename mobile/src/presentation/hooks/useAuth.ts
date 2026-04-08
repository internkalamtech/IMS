import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
    return useAuthContext();
}
const logout = () => {
    setUser(null);
};

