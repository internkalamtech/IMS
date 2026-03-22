import { DemoCredential } from '../entities/demo-credential';
import { User } from '../entities/user';

export interface AuthRepository {
    login(email: string, password: string): Promise<User>;

    logout(): Promise<void>;
    getCurrentUser(): Promise<User | null>;
    getDemoCredentials(): Promise<DemoCredential[]>;
}
