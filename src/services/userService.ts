import { UserRepository } from '../repositories/userRepository';

export interface IUserUpdateData {
  name?: string;
  email?: string;
  [key: string]: any;
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers() {
    try {
      return await this.userRepository.findAll();
    } catch (error) {
      console.error('Error in UserService.getAllUsers:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error('Error in UserService.getUserById:', error);
      if (error instanceof Error && error.message === 'User not found') {
        throw error;
      }
      throw new Error('Failed to fetch user');
    }
  }

  async updateUser(id: string, updateData: IUserUpdateData) {
    try {
      // Business logic: validate update data
      if (updateData.email) {
        const existingUser = await this.userRepository.findByEmail(updateData.email);
        if (existingUser && (existingUser as any)._id.toString() !== id) {
          throw new Error('Email already exists');
        }
      }

      const user = await this.userRepository.updateById(id, updateData);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error('Error in UserService.updateUser:', error);
      if (error instanceof Error && (error.message === 'User not found' || error.message === 'Email already exists')) {
        throw error;
      }
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(id: string) {
    try {
      const user = await this.userRepository.deleteById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error in UserService.deleteUser:', error);
      if (error instanceof Error && error.message === 'User not found') {
        throw error;
      }
      throw new Error('Failed to delete user');
    }
  }
} 