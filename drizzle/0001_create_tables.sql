-- Create profiles table (users/employees)
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  color_code TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create service categories table
CREATE TABLE IF NOT EXISTS services_categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(36) PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES services_categories(id),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create staff skills table
CREATE TABLE IF NOT EXISTS staff_skills (
  profile_id VARCHAR(36) NOT NULL REFERENCES profiles(id),
  category_id INTEGER NOT NULL REFERENCES services_categories(id),
  PRIMARY KEY (profile_id, category_id)
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(36) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(36) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  client_id VARCHAR(36) NOT NULL REFERENCES clients(id),
  staff_id VARCHAR(36) NOT NULL REFERENCES profiles(id),
  service_id VARCHAR(36) NOT NULL REFERENCES services(id),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Create users table (legacy)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
