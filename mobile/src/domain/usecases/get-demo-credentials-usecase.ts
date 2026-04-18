import { DemoCredential } from '../entities/demo-credential';
import { AuthRepository } from '../repositories/auth-repository';

export class GetDemoCredentialsUseCase {
    constructor(private authRepository: AuthRepository) { }

    async execute(): Promise<DemoCredential[]> {
        return this.authRepository.getDemoCredentials();
    }
}
