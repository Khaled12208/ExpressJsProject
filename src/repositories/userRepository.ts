import { User } from '../models/User';
import { Types } from 'mongoose';

export class UserRepository {
  async findAll() {
    return await User.find().select('-password');
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await User.findById(id).select('-password');
  }

  async updateById(id: string, updateData: any) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
  }

  async deleteById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await User.findByIdAndDelete(id);
  }

  async findByEmail(email: string) {
    return await User.findOne({ email });
  }

  async create(userData: any) {
    const user = new User(userData);
    await user.save();
    return await User.findById(user._id).select('-password');
  }
} 