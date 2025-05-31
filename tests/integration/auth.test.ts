/// <reference types="jest" />
import request from 'supertest';
import app from '../../src/server';
import { User } from '../../src/models/User';
import mongoose from 'mongoose';
import { expect } from '@jest/globals';
import { clearDatabase } from '../setup';

describe('Auth API Integration Tests', () => {
  const testUser = {
    name: 'Test User',
    email: 'test.auth@test.com', // Unique email for auth tests
    password: 'Password123!',
  };

  beforeAll(async () => {
    await clearDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('name', testUser.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register user with existing email', async () => {
      // First create a user
      await User.create(testUser);

      // Try to register with the same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'message',
        'User with this email already exists'
      );
    });

    it('should handle invalid registration data', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'invalid-email',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'message',
        'All fields are required'
      );
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      // First create a user
      await User.create(testUser);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not login with incorrect password', async () => {
      // First create a user
      await User.create(testUser);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'anypassword',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should handle invalid login data', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'invalid-email',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
