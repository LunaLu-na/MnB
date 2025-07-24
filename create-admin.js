import mongoose from 'mongoose';
import User from './server/models/user.model.js';
import config from './config/config.js';

// Connect to MongoDB
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username:', existingAdmin.username);
      console.log('Name:', existingAdmin.name);
      console.log('Email:', existingAdmin.email);
      console.log('Admin:', existingAdmin.admin);
      process.exit(0);
    }

    // Create new admin user
    const adminUser = new User({
      name: 'Administrator',
      username: 'admin',
      email: 'admin@migsandbia.com',
      password: 'admin123',
      admin: true
    });

    const savedUser = await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Username:', savedUser.username);
    console.log('Name:', savedUser.name);
    console.log('Email:', savedUser.email);
    console.log('Admin:', savedUser.admin);
    console.log('');
    console.log('You can now sign in with:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('');
    console.log('IMPORTANT: Please change the password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createAdminUser();
