const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const authController = {
  // POST /api/auth/register
  async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, company_name } = req.body;

    try {
      const userExists = await User.existsByEmail(email);
      if (userExists) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        email,
        password_hash: passwordHash,
        name,
        company_name
      });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company_name: user.company_name
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // POST /api/auth/login
  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company_name: user.company_name,
          phone: user.phone
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // GET /api/auth/profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company_name: user.company_name,
          phone: user.phone,
          created_at: user.created_at
        }
      });
    } catch (err) {
      console.error('Get profile error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // PUT /api/auth/profile
  async updateProfile(req, res) {
    const { name, email, company_name, phone, current_password, new_password } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // If changing password, verify current password
      if (new_password) {
        if (!current_password) {
          return res.status(400).json({ error: 'Current password is required' });
        }

        const isMatch = await bcrypt.compare(current_password, user.password_hash);
        if (!isMatch) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(new_password, salt);
        await User.updatePassword(req.user.id, passwordHash);
      }

      // Update other fields
      const updatedUser = await User.update(req.user.id, {
        name: name || user.name,
        email: email || user.email,
        company_name: company_name !== undefined ? company_name : user.company_name,
        phone: phone !== undefined ? phone : user.phone
      });

      res.json({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          company_name: updatedUser.company_name,
          phone: updatedUser.phone
        }
      });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = authController;
