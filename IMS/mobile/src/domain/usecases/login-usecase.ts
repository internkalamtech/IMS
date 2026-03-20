import { ValidationError } from '@/core/error';
import { User } from '../entities/user';
import { AuthRepository } from '../repositories/auth-repository';

export class LoginUseCase {
    constructor(private authRepository: AuthRepository) { }

    async execute(email: string, password: string): Promise<User> {
        if (!email) {
            throw new ValidationError('Email is required');
        }
        if (!email.includes('@')) {
            throw new ValidationError('Invalid email format');
        }
        if (!password) {
            throw new ValidationError('Password is required');
        }
        return this.authRepository.login(email, password);
    }

}
