-- Database setup for Events API
-- Run this script in your Supabase PostgreSQL database

-- Create provinces table
CREATE TABLE IF NOT EXISTS provinces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(15, 12),
    longitude DECIMAL(15, 12),
    display_order INTEGER
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    id_province INTEGER NOT NULL,
    latitude DECIMAL(15, 12),
    longitude DECIMAL(15, 12),
    FOREIGN KEY (id_province) REFERENCES provinces(id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Create event_locations table
CREATE TABLE IF NOT EXISTS event_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_address TEXT NOT NULL,
    id_location INTEGER NOT NULL,
    max_capacity INTEGER NOT NULL,
    latitude DECIMAL(15, 12),
    longitude DECIMAL(15, 12),
    id_creator_user INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_location) REFERENCES locations(id),
    FOREIGN KEY (id_creator_user) REFERENCES users(id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    id_event_location INTEGER NOT NULL,
    start_date TIMESTAMP NOT NULL,
    duration_in_minutes INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    enabled_for_enrollment BOOLEAN DEFAULT true,
    max_assistance INTEGER NOT NULL,
    id_creator_user INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_event_location) REFERENCES event_locations(id),
    FOREIGN KEY (id_creator_user) REFERENCES users(id)
);

-- Create event_tags table (junction table for many-to-many relationship)
CREATE TABLE IF NOT EXISTS event_tags (
    id SERIAL PRIMARY KEY,
    id_event INTEGER NOT NULL,
    id_tag INTEGER NOT NULL,
    FOREIGN KEY (id_event) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (id_tag) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(id_event, id_tag)
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    id_event INTEGER NOT NULL,
    id_user INTEGER NOT NULL,
    registration_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT false,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    description TEXT,
    FOREIGN KEY (id_event) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(id_event, id_user)
);

-- Insert sample data for provinces
INSERT INTO provinces (id, name, full_name, latitude, longitude) VALUES
(1, 'Ciudad Autónoma de Buenos Aires', 'Ciudad Autónoma de Buenos Aires', -34.61444091796875, -58.445877075195312),
(2, 'Buenos Aires', 'Provincia de Buenos Aires', -34.61444091796875, -58.445877075195312)
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for locations
INSERT INTO locations (id, name, id_province, latitude, longitude) VALUES
(3391, 'Nuñez', 1, -34.548805236816406, -58.463230133056641),
(3397, 'Villa Crespo', 1, -34.599876403808594, -58.438816070556641)
ON CONFLICT (id) DO NOTHING;

-- Insert sample tags
INSERT INTO tags (id, name) VALUES
(1, 'Rock'),
(2, 'Pop'),
(3, 'Jazz'),
(4, 'Electrónica'),
(5, 'Clásica')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_creator ON events(id_creator_user);
CREATE INDEX IF NOT EXISTS idx_enrollments_event ON enrollments(id_event);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(id_user);
CREATE INDEX IF NOT EXISTS idx_event_tags_event ON event_tags(id_event);
CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON event_tags(id_tag);
CREATE INDEX IF NOT EXISTS idx_event_locations_creator ON event_locations(id_creator_user);

-- Grant necessary permissions (if needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Verify tables were created
SELECT 'Tables created successfully!' as status; 