const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@britiscientific.com';
    const adminPasswordRaw = 'Ad@123'; // Exactly 6 chars: uppercase, lowercase, number, special char

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`[Seed Admin] Admin account (${adminEmail}) already exists. Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPasswordRaw, salt);

    const adminUser = await User.create({
      fullName: 'System Administrator',
      email: adminEmail,
      phone: '+91 98765 43210',
      companyName: 'Briti Scientific Lab Supplies',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    });

    console.log(`[Seed Admin] Admin created successfully! Email: ${adminUser.email}, Role: ${adminUser.role}`);
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Admin Error]: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
