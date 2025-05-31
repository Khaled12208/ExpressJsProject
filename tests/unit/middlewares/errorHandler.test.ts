import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../src/middlewares/errorHandler';

describe('Error Handler Middleware', () => {
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
  });

  it('should handle ValidationError', () => {
    const error = new Error('Validation failed');
    (error as any).name = 'ValidationError';
    (error as any).errors = {
      field1: { message: 'Field1 is required' },
      field2: { message: 'Field2 is invalid' },
    };

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(responseObject).toEqual({
      message: 'Validation failed',
      errors: {
        field1: 'Field1 is required',
        field2: 'Field2 is invalid',
      },
    });
  });

  it('should handle CastError', () => {
    const error = new Error('Cast to ObjectId failed');
    (error as any).name = 'CastError';

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(responseObject).toEqual({
      message: 'Invalid ID format',
    });
  });

  it('should handle JsonWebTokenError', () => {
    const error = new Error('jwt malformed');
    (error as any).name = 'JsonWebTokenError';

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(responseObject).toEqual({
      message: 'Invalid token',
    });
  });

  it('should handle TokenExpiredError', () => {
    const error = new Error('jwt expired');
    (error as any).name = 'TokenExpiredError';

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(responseObject).toEqual({
      message: 'Token expired',
    });
  });

  it('should handle custom error with status code', () => {
    const error = new Error('Custom error');
    (error as any).statusCode = 403;

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(responseObject).toEqual({
      message: 'Custom error',
    });
  });

  it('should handle unknown errors', () => {
    const error = new Error('Unknown error');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(responseObject).toEqual({
      message: 'Internal server error',
    });
  });

  it('should handle errors with no message', () => {
    const error = new Error();

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(responseObject).toEqual({
      message: 'Internal server error',
    });
  });
});
