import { Request, Response, RequestHandler } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';

export const userController = {
  // Get all users
  getAllUsers: (async (req: Request, res: Response) => {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  }) as RequestHandler,

  // Get user by ID
  getUserById: (async (req: AuthRequest, res: Response) => {
    try {
      console.log('Getting user by ID:', req.params.id);
      console.log('Current user:', req.user);

      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error in getUserById:', error);
      if (error instanceof Error && error.name === 'CastError') {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(500).json({ message: 'Error fetching user' });
    }
  }) as RequestHandler,

  // Update user
  updateUser: (async (req: AuthRequest, res: Response) => {
    try {
      console.log('Updating user:', req.params.id);
      console.log('Update data:', req.body);
      console.log('Current user:', req.user);

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        console.log('User not found for update');
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error in updateUser:', error);
      if (error instanceof Error && error.name === 'CastError') {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(500).json({ message: 'Error updating user' });
    }
  }) as RequestHandler,

  // Delete user
  deleteUser: (async (req: AuthRequest, res: Response) => {
    try {
      console.log('Deleting user:', req.params.id);
      console.log('Current user:', req.user);

      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        console.log('User not found for deletion');
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      if (error instanceof Error && error.name === 'CastError') {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(500).json({ message: 'Error deleting user' });
    }
  }) as RequestHandler,
};
