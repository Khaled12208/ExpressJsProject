import { Request, Response, NextFunction } from 'express';
import { User } from '../../../src/models/User';
import { userController } from '../../../src/controllers/userController';
import mongoose from 'mongoose';

// Mock the User model
jest.mock('../../../src/models/User');

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseObject: any = {};

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
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
      ];

      // Mock the select method
      (User.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });

      await userController.getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(User.find).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle errors when getting users', async () => {
      const error = new Error('Database error');
      (User.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockRejectedValue(error),
      });

      await userController.getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
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
      };

      mockRequest.params = { id: mockUser._id.toString() };

      // Mock the select method
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };

      // Mock the select method returning null
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });
  });
});
