import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Order from '../models/Order.js';
import { sendEmail } from '../utils/mailer.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// ==============================
// AUTH & USERS
// ==============================

router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    if (!name) return res.status(400).json({ error: 'Name is required to register.' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin: email.toLowerCase() === 'mueezzakir6@gmail.com'
    });
    
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, isAdmin: user.isAdmin, joinedAt: user.joinedAt } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });
    
    // Ensure specific user is always admin
    if (user.email === 'mueezzakir6@gmail.com' && !user.isAdmin) {
      user.isAdmin = true;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, isAdmin: user.isAdmin, joinedAt: user.joinedAt } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists, but for convenience in lab:
      return res.status(404).json({ error: 'No account with that email found.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${req.get('origin') || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const info = await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - MetaVogue',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Password Reset Request</h2>
          <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
          <p>Please click on the following link to complete the process:</p>
          <a href="${resetUrl}" style="padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <hr />
          <p style="font-size: 12px; color: #777;">Link expires in 1 hour.</p>
        </div>
      `
    });

    res.json({ success: true, message: 'Reset email sent.', previewUrl: info.previewUrl });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/toggle-admin', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.email === 'mueezzakir6@gmail.com') return res.status(400).json({ error: 'Cannot toggle super admin' });
    
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ success: true, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // We set a temporary password
    const hashedPassword = await bcrypt.hash('Password123', 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ success: true, message: 'Password reset to Password123' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    if (email.toLowerCase() === 'mueezzakir6@gmail.com') return res.status(400).json({ error: 'Cannot delete super admin' });
    
    await User.findOneAndDelete({ email: email.toLowerCase() });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import multer from 'multer';
import path from 'path';

// ==============================
// FILE UPLOADS
// ==============================

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return relative URL that the frontend can use to reach it
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// PROJECTS
// ==============================

router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ date: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    await Project.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// ORDERS
// ==============================

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    await Order.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders/:id/comments', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    order.comments.push(req.body);
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
