import { Request, Response } from 'express';
import { Product } from '../models/Product';

interface ValidationError extends Error {
  name: string;
  message: string;
}

export const productController = {
  getAllProducts: async (req: Request, res: Response) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products' });
    }
  },

  getProductById: async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching product' });
    }
  },

  createProduct: async (req: Request, res: Response) => {
    try {
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof Error && error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error creating product' });
    }
  },

  updateProduct: async (req: Request, res: Response) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error updating product' });
    }
  },

  deleteProduct: async (req: Request, res: Response) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting product' });
    }
  },
};
