import { Router } from 'express';
import { UsersController } from '../../controllers/userController';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const userRouter = Router();

// Create controller instance
const usersController = new UsersController();

// Protect all user routes with authentication
userRouter.use(authMiddleware);

// Get all users
userRouter.get('/', usersController.getAllUsers);

// Get user by ID
userRouter.get('/:id', usersController.getUserById);

// Update user
userRouter.put('/:id', usersController.updateUser);

// Delete user
userRouter.delete('/:id', usersController.deleteUser);
