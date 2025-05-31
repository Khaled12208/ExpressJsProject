import { Request, Response, NextFunction } from 'express';

interface ValidationError extends Error {
  name: string;
  errors?: {
    [key: string]: {
      message: string;
    };
  };
}

interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  error: Error | ValidationError | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle Mongoose validation errors
  if (error.name === 'ValidationError' && (error as ValidationError).errors) {
    const errors: { [key: string]: string } = {};
    Object.keys((error as ValidationError).errors || {}).forEach((key) => {
      errors[key] = (error as ValidationError).errors![key].message;
    });
    return res.status(400).json({
      message: error.message,
      errors,
    });
  }

  // Handle Mongoose CastError (invalid ID)
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired',
    });
  }

  // Handle custom errors with status code
  if ((error as CustomError).statusCode) {
    return res.status((error as CustomError).statusCode!).json({
      message: error.message,
    });
  }

  // Handle all other errors
  res.status(500).json({
    message: 'Internal server error',
  });
};
