import { Router } from 'express';
import { User } from '../../models/User';
import { Product } from '../../models/Product';

export const testRouter = Router();

// Cleanup test data
testRouter.delete('/cleanup', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not allowed in production' });
  }

  try {
    // Delete test users
    await User.deleteMany({
      email: { $regex: /^test.*@example\.com$/ },
    });

    // Delete test products
    await Product.deleteMany({
      name: { $regex: /^Test.*/ },
    });

    res.json({ message: 'Test data cleaned up' });
  } catch (error) {
    res.status(500).json({ message: 'Error cleaning up test data' });
  }
});
