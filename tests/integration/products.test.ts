/// <reference types="jest" />
import request from 'supertest';
import app from '../../src/server';
import { User } from '../../src/models/User';
import { Product } from '../../src/models/Product';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { expect } from '@jest/globals';
import { clearDatabase } from '../setup';

interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

describe('Products API Integration Tests', () => {
  let authToken: string;
  let testUser: any;
  let testProduct: any;

  beforeAll(async () => {
    await clearDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test.products@test.com', // Unique email for product tests
      password: 'password123',
      role: 'admin',
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Create a test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'Test Category',
      stock: 10,
    });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe('GET /api/v1/products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('name', 'Test Product');
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should get product by id', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Test Product');
      expect(response.body).toHaveProperty('price', 99.99);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Product not found');
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'New Description',
        price: 149.99,
        category: 'New Category',
        stock: 20,
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', 'New Product');
      expect(response.body).toHaveProperty('price', 149.99);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should update product', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 199.99,
      };

      const response = await request(app)
        .put(`/api/v1/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Product');
      expect(response.body).toHaveProperty('price', 199.99);
    });

    it('should return 404 when updating non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/v1/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Product not found');
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete product', async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Product deleted successfully'
      );

      // Verify product is deleted
      const deletedProduct = await Product.findById(testProduct._id);
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 when deleting non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/v1/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Product not found');
    });
  });
});
