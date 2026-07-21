import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper: Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: 'fail', message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: { user: { id: user._id, name: user.name, email: user.email } },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: { user: { id: user._id, name: user.name, email: user.email } },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};