import { UserRepository, ClassData } from '@/domain/repositories/user-repository';

export class GetClassesUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(): Promise<ClassData[]> {
        return this.userRepository.getClasses();
    }
}