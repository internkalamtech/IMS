import { UserRepository } from '@/domain/repositories/user-repository';

export class GetDashboardDataUseCase {
    constructor(private userRepository: UserRepository) { }

    async execute(role: string): Promise<any> {
        return this.userRepository.getDashboardData(role);
    }
}
