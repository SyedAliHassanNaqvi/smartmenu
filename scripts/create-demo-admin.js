const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...rest] = trimmed.split('=');
    if (!key || process.env[key]) return;
    process.env[key] = rest.join('=').trim().replace(/^"|"$/g, '');
  });
}

async function main() {
  loadEnv();

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'smartmenu';

  if (!uri) {
    throw new Error('MONGODB_URI is required in .env or environment');
  }

  const connection = await mongoose.connect(uri, {
    dbName,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });

  const restaurantSchema = new mongoose.Schema(
    {
      name: String,
      ownerEmail: String,
      ownerName: String,
      address: String,
      phone: String,
      description: String,
      logo: String,
      theme: {
        primaryColor: String,
        secondaryColor: String,
      },
      settings: {
        currency: String,
        timezone: String,
        language: String,
        taxRate: Number,
      },
      subscription: {
        plan: String,
        status: String,
        expiresAt: Date,
      },
    },
    { timestamps: true }
  );

  const userSchema = new mongoose.Schema(
    {
      email: { type: String, lowercase: true, trim: true },
      password: String,
      name: String,
      role: String,
      restaurantId: String,
      isActive: Boolean,
      lastLogin: Date,
    },
    { timestamps: true }
  );

  const Restaurant = connection.models.Restaurant || connection.model('Restaurant', restaurantSchema);
  const User = connection.models.User || connection.model('User', userSchema);

  const restaurant = await Restaurant.create({
    name: 'Demo SmartMenu Restaurant',
    ownerEmail: 'demo-admin@smartmenu.local',
    ownerName: 'Demo Admin',
    address: '123 Demo Street',
    phone: '+1234567890',
    description: 'Demo restaurant for SmartMenu testing',
    theme: {
      primaryColor: '#2563eb',
      secondaryColor: '#4f46e5',
    },
    settings: {
      currency: 'EUR',
      timezone: 'Europe/Rome',
      language: 'en',
      taxRate: 0.22,
    },
    subscription: {
      plan: 'basic',
      status: 'active',
    },
  });

  const hashedPassword = await bcrypt.hash('DemoPass123!', 12);

  const user = await User.create({
    email: 'admin@demo.smartmenu',
    password: hashedPassword,
    name: 'Demo Admin',
    role: 'admin',
    restaurantId: restaurant._id.toString(),
    isActive: true,
  });

  console.log('=== Demo Admin Created ===');
  console.log('Restaurant ID:', restaurant._id.toString());
  console.log('Restaurant name:', restaurant.name);
  console.log('Admin email:', user.email);
  console.log('Admin password: DemoPass123!');
  console.log('Login URL: http://localhost:3000/admin/login');

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Failed to create demo admin:', error);
  process.exit(1);
});