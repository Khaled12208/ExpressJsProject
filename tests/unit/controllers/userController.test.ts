import { Request, Response } from 'express';
import { UsersController } from '../../../src/controllers/userController';
import { UserService } from '../../../src/services/userService';
import { AuthRequest } from '../../../src/middlewares/authMiddleware';
import mongoose from 'mongoose';

// Mock the UserService
jest.mock('../../../src/services/userService');

describe('UsersController', () => {
  let usersController: UsersController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockUserService: jest.Mocked<UserService>;
  let responseObject: any = {};

  beforeEach(() => {
    // Create mock service methods
    mockUserService = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    } as any;

    // Mock the UserService constructor
    (UserService as jest.MockedClass<typeof UserService>).mockImplementation(() => mockUserService);

    // Create controller instance
    usersController = new UsersController();

    // Create mock request and response
    mockRequest = {
      params: {},
      body: {},
      user: { userId: 'user123' }
    };
    
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    responseObject = {};
    mockResponse.json = jest.fn().mockImplementation((result) => {
      responseObject = result;
      return mockResponse;
    });

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      const mockUsers = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'User 1',
          email: 'user1@test.com',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'User 2',
          email: 'user2@test.com',
        },
      ] as any[];

      // Mock the service method
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      await usersController.getAllUsers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserService.getAllUsers).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle errors when getting users', async () => {
      const error = new Error('Failed to fetch users');
      mockUserService.getAllUsers.mockRejectedValue(error);

      await usersController.getAllUsers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error fetching users',
      });
    });
  });

  describe('getUserById', () => {
    it('should get user by id successfully', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        email: 'test@test.com',
      } as any;

      mockRequest.params = { id: mockUser._id.toString() };

      // Mock the service method
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await usersController.getUserById(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.params = { id: userId };

      // Mock the service method to throw user not found error
      const error = new Error('User not found');
      mockUserService.getUserById.mockRejectedValue(error);

      await usersController.getUserById(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should handle service errors', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.params = { id: userId };

      // Mock the service method to throw a general error
      const error = new Error('Database connection failed');
      mockUserService.getUserById.mockRejectedValue(error);

      await usersController.getUserById(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error fetching user',
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: 'Updated Name' };
      const updatedUser = {
        _id: userId,
        name: 'Updated Name',
        email: 'test@test.com',
      } as any;

      mockRequest.params = { id: userId };
      mockRequest.body = updateData;

      mockUserService.updateUser.mockResolvedValue(updatedUser);

      await usersController.updateUser(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should handle email already exists error', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const updateData = { email: 'existing@test.com' };

      mockRequest.params = { id: userId };
      mockRequest.body = updateData;

      const error = new Error('Email already exists');
      mockUserService.updateUser.mockRejectedValue(error);

      await usersController.updateUser(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email already exists',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.params = { id: userId };

      const deleteResult = { message: 'User deleted successfully' };
      mockUserService.deleteUser.mockResolvedValue(deleteResult);

      await usersController.deleteUser(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.json).toHaveBeenCalledWith(deleteResult);
    });

    it('should handle user not found during deletion', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.params = { id: userId };

      const error = new Error('User not found');
      mockUserService.deleteUser.mockRejectedValue(error);

      await usersController.deleteUser(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });
  });
});
