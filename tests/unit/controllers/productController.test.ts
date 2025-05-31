import { Request, Response } from 'express';
import { Product } from '../../../src/models/Product';
import { productController } from '../../../src/controllers/productController';
import mongoose from 'mongoose';

// Mock the Product model
jest.mock('../../../src/models/Product');

describe('ProductController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any = {};

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
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

  describe('getAllProducts', () => {
    it('should get all products successfully', async () => {
      const mockProducts = [
        { _id: new mongoose.Types.ObjectId(), name: 'Product 1', price: 100 },
        { _id: new mongoose.Types.ObjectId(), name: 'Product 2', price: 200 },
      ];

      (Product.find as jest.Mock).mockResolvedValue(mockProducts);

      await productController.getAllProducts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Product.find).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled(); // Default 200 status
      expect(responseObject).toEqual(mockProducts);
    });

    it('should handle database error when getting products', async () => {
      (Product.find as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await productController.getAllProducts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({ message: 'Error fetching products' });
    });
  });

  describe('getProductById', () => {
    const mockProductId = new mongoose.Types.ObjectId();

    it('should get product by id successfully', async () => {
      const mockProduct = {
        _id: mockProductId,
        name: 'Test Product',
        price: 100,
      };

      mockRequest.params = { id: mockProductId.toString() };
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);

      await productController.getProductById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Product.findById).toHaveBeenCalledWith(mockProductId.toString());
      expect(responseObject).toEqual(mockProduct);
    });

    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: mockProductId.toString() };
      (Product.findById as jest.Mock).mockResolvedValue(null);

      await productController.getProductById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({ message: 'Product not found' });
    });

    it('should handle database error when getting product by id', async () => {
      mockRequest.params = { id: mockProductId.toString() };
      (Product.findById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await productController.getProductById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({ message: 'Error fetching product' });
    });
  });

  describe('createProduct', () => {
    const mockProductData = {
      name: 'New Product',
      price: 150,
      description: 'Test description',
    };

    it('should create product successfully', async () => {
      const mockCreatedProduct = {
        _id: new mongoose.Types.ObjectId(),
        ...mockProductData,
      };

      mockRequest.body = mockProductData;
      (Product.create as jest.Mock).mockResolvedValue(mockCreatedProduct);

      await productController.createProduct(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Product.create).toHaveBeenCalledWith(mockProductData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual(mockCreatedProduct);
    });

    it('should handle validation error when creating product', async () => {
      mockRequest.body = { name: 'Invalid Product' }; // Missing required fields
      const validationError = new Error('Validation failed');
      (validationError as any).name = 'ValidationError';

      (Product.create as jest.Mock).mockRejectedValue(validationError);

      await productController.createProduct(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toHaveProperty('message');
    });

    it('should handle database error when creating product', async () => {
      mockRequest.body = mockProductData;
      (Product.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await productController.createProduct(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({ message: 'Error creating product' });
    });
  });

  describe('updateProduct', () => {
    const mockProductId = new mongoose.Types.ObjectId();
    const mockUpdateData = {
      name: 'Updated Product',
      price: 200,
    };

    it('should update product successfully', async () => {
      const mockUpdatedProduct = {
        _id: mockProductId,
        ...mockUpdateData,
      };

      mockRequest.params = { id: mockProductId.toString() };
      mockRequest.body = mockUpdateData;
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockUpdatedProduct
      );

      await productController.updateProduct(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProductId.toString(),
        { $set: mockUpdateData },
        { new: true }
      );
      expect(responseObject).toEqual(mockUpdatedProduct);
    });

    it('should return 404 when updating non-existent product', async () => {
      mockRequest.params = { id: mockProductId.toString() };
      mockRequest.body = mockUpdateData;
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await productController.updateProduct(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({ message: 'Product not found' });
    });

    it('should handle database error when updating product', async () => {
      mockRequest.params = { id: mockProductId.toString() };
      mockRequest.body = mockUpdateData;
      (Product.findByIdAndUpdate as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await productController.updateProduct(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({ message: 'Error updating product' });
    });
  });

  describe('deleteProduct', () => {
    const mockProductId = new mongoose.Types.ObjectId();

    it('should delete product successfully', async () => {
      const mockDeletedProduct = {
        _id: mockProductId,
        name: 'Deleted Product',
      };

      mockRequest.params = { id: mockProductId.toString() };
      (Product.findByIdAndDelete as jest.Mock).mockResolvedValue(
        mockDeletedProduct
      );

      await productController.deleteProduct(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Product.findByIdAndDelete).toHaveBeenCalledWith(
        mockProductId.toString()
      );
      expect(responseObject).toEqual({
        message: 'Product deleted successfully',
      });
    });

    it('should return 404 when deleting non-existent product', async () => {
      mockRequest.params = { id: mockProductId.toString() };
      (Product.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await productController.deleteProduct(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({ message: 'Product not found' });
    });

    it('should handle database error when deleting product', async () => {
      mockRequest.params = { id: mockProductId.toString() };
      (Product.findByIdAndDelete as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await productController.deleteProduct(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({ message: 'Error deleting product' });
    });
  });
});
