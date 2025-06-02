import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UserService } from '../services/userService';

export class UsersController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Get all users
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error in UsersController.getAllUsers:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  };

  // Get user by ID
  getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('Getting user by ID:', req.params.id);
      console.log('Current user:', req.user);

      const user = await this.userService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      console.error('Error in UsersController.getUserById:', error);
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(500).json({ message: 'Error fetching user' });
    }
  };

  // Update user
  updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('Updating user:', req.params.id);
      console.log('Update data:', req.body);
      console.log('Current user:', req.user);

      const user = await this.userService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      console.error('Error in UsersController.updateUser:', error);
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({ message: 'User not found' });
          return;
        }
        if (error.message === 'Email already exists') {
          res.status(400).json({ message: 'Email already exists' });
          return;
        }
      }
      res.status(500).json({ message: 'Error updating user' });
    }
  };

  // Delete user
  deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('Deleting user:', req.params.id);
      console.log('Current user:', req.user);

      const result = await this.userService.deleteUser(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error in UsersController.deleteUser:', error);
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(500).json({ message: 'Error deleting user' });
    }
  };
}
