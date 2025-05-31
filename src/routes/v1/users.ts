import { Router } from 'express';
import { userController } from '../../controllers/userController';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const userRouter = Router();

// Protect all user routes with authentication
userRouter.use(authMiddleware);

// Get all users
userRouter.get('/', userController.getAllUsers);

// Get user by ID
userRouter.get('/:id', userController.getUserById);

// Update user
userRouter.put('/:id', userController.updateUser);

// Delete user
userRouter.delete('/:id', userController.deleteUser);
