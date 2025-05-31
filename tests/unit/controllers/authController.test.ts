import { Request, Response, NextFunction } from 'express';
import { User } from '../../../src/models/User';
import { authController } from '../../../src/controllers/authController';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Mock the User model and jwt
jest.mock('../../../src/models/User');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseObject: any = {};

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
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

  describe('register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const mockUserId = new mongoose.Types.ObjectId();
      const mockToken = 'mock-jwt-token';

      mockRequest.body = validUserData;

      // Mock User.findOne to return null (user doesn't exist)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Mock User.create to return a new user
      (User.create as jest.Mock).mockResolvedValue({
        _id: mockUserId,
        ...validUserData,
        role: 'user',
      });

      // Mock jwt.sign
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual({
        message: 'User registered successfully',
        token: mockToken,
        user: {
          id: mockUserId,
          email: validUserData.email,
          name: validUserData.name,
          role: 'user',
        },
      });
    });

    it('should not register user with existing email', async () => {
      mockRequest.body = validUserData;

      // Mock User.findOne to return an existing user
      (User.findOne as jest.Mock).mockResolvedValue({
        email: validUserData.email,
      });

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        message: 'User with this email already exists',
      });
    });

    it('should handle missing required fields', async () => {
      mockRequest.body = { email: 'test@example.com' }; // Missing password and name

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        message: 'All fields are required',
      });
    });

    it('should handle invalid email format', async () => {
      mockRequest.body = {
        ...validUserData,
        email: 'invalid-email',
      };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        message: 'Invalid email format',
      });
    });

    it('should handle database errors', async () => {
      mockRequest.body = validUserData;

      // Mock User.findOne to throw an error
      (User.findOne as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        message: 'Error registering user',
      });
    });
  });

  describe('login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login successfully with correct credentials', async () => {
      const mockUserId = new mongoose.Types.ObjectId();
      const mockToken = 'mock-jwt-token';
      const mockUser = {
        _id: mockUserId,
        email: validCredentials.email,
        name: 'Test User',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockRequest.body = validCredentials;

      // Mock User.findOne to return a user
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Mock jwt.sign
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUser.comparePassword).toHaveBeenCalledWith(
        validCredentials.password
      );
      expect(responseObject).toEqual({
        message: 'Login successful',
        token: mockToken,
        user: {
          id: mockUserId,
          email: validCredentials.email,
          name: 'Test User',
          role: 'user',
        },
      });
    });

    it('should not login with incorrect password', async () => {
      const mockUser = {
        email: validCredentials.email,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      mockRequest.body = validCredentials;

      // Mock User.findOne to return a user
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUser.comparePassword).toHaveBeenCalledWith(
        validCredentials.password
      );
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        message: 'Invalid credentials',
      });
    });

    it('should not login with non-existent email', async () => {
      mockRequest.body = validCredentials;

      // Mock User.findOne to return null
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        message: 'Invalid credentials',
      });
    });

    it('should handle database errors during login', async () => {
      mockRequest.body = validCredentials;

      // Mock User.findOne to throw an error
      (User.findOne as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        message: 'Error logging in',
      });
    });
  });
});
