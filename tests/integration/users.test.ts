/// <reference types="jest" />
import request from 'supertest';
import app from '../../src/server';
import { User } from '../../src/models/User';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { expect } from '@jest/globals';
import { clearDatabase } from '../setup';

describe('User API Integration Tests', () => {
  let authToken: string;
  let testUser: any;
  let testUserId: string;

  beforeAll(async () => {
    await clearDatabase();
  });

  beforeEach(async () => {
    // Clear database before each test
    await clearDatabase();

    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test.users@test.com',
      password: 'password123',
      role: 'admin',
    });

    testUserId = testUser._id.toString();

    // Create additional test users
    await Promise.all([
      User.create({
        name: 'User 2',
        email: 'user2.users@test.com',
        password: 'password123',
        role: 'user',
      }),
      User.create({
        name: 'User 3',
        email: 'user3.users@test.com',
        password: 'password123',
        role: 'user',
      }),
    ]);

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUserId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Wait a bit to ensure all database operations are complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify test data was created
    const users = await User.find();
    if (users.length !== 3) {
      console.error('Current users:', users);
      throw new Error(
        `Expected 3 users to be created, but found ${users.length}`
      );
    }
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe('GET /api/v1/users', () => {
    it('should get all users', async () => {
      // Verify users exist before making request
      const dbUsers = await User.find();
      expect(dbUsers.length).toBe(3);

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(3);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).not.toHaveProperty('password');

      // Verify user data
      const userEmails = response.body.map((user: any) => user.email).sort();
      expect(userEmails).toEqual(
        [
          'test.users@test.com',
          'user2.users@test.com',
          'user3.users@test.com',
        ].sort()
      );
    });

    it('should fail without auth token', async () => {
      const response = await request(app).get('/api/v1/users');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user by id', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', testUserId);
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('email', 'test.users@test.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update user', async () => {
      // Verify user exists before update
      const userBeforeUpdate = await User.findById(testUserId);
      expect(userBeforeUpdate).toBeTruthy();

      const updateData = {
        name: 'Updated Test User',
      };

      const response = await request(app)
        .put(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Test User');
      expect(response.body).not.toHaveProperty('password');

      // Verify the update in database
      const updatedUser = await User.findById(testUserId);
      expect(updatedUser?.name).toBe('Updated Test User');
      expect(updatedUser?.email).toBe('test.users@test.com'); // Email should remain unchanged
    });

    it('should return 404 when updating non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete user', async () => {
      // Verify user exists before deletion
      const userBeforeDelete = await User.findById(testUserId);
      expect(userBeforeDelete).toBeTruthy();

      const response = await request(app)
        .delete(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'User deleted successfully'
      );

      // Verify user is deleted
      const deletedUser = await User.findById(testUserId);
      expect(deletedUser).toBeNull();

      // Verify only this user was deleted
      const remainingUsers = await User.find();
      expect(remainingUsers.length).toBe(2);
    });

    it('should return 404 when deleting non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });
});
