-- =============================================
-- KU Apps - Database Schema (PostgreSQL)
-- =============================================

-- Table: desa
CREATE TABLE IF NOT EXISTS desa (
  id SERIAL PRIMARY KEY,
  nama_desa VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: kelompok
CREATE TABLE IF NOT EXISTS kelompok (
  id SERIAL PRIMARY KEY,
  nama_kelompok VARCHAR(100) NOT NULL,
  desa_id INTEGER NOT NULL REFERENCES desa(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  no_telp VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('KUadmin', 'KU Desa', 'KU Kelompok')),
  desa_id INTEGER REFERENCES desa(id),
  kelompok_id INTEGER REFERENCES kelompok(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: pencatatan_header
CREATE TABLE IF NOT EXISTS pencatatan_header (
  id SERIAL PRIMARY KEY,
  bulan INTEGER NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  tahun INTEGER NOT NULL,
  desa_id INTEGER REFERENCES desa(id),
  kelompok_id INTEGER REFERENCES kelompok(id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: pencatatan_detail
CREATE TABLE IF NOT EXISTS pencatatan_detail (
  id SERIAL PRIMARY KEY,
  header_id INTEGER NOT NULL REFERENCES pencatatan_header(id) ON DELETE CASCADE,
  nama VARCHAR(200) NOT NULL,
  jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('pemasukan', 'pengeluaran')),
  nominal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tanggal DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Seed Data (optional)
-- =============================================

-- Insert sample desa
INSERT INTO desa (nama_desa) VALUES ('Desa Sukamaju'), ('Desa Mekarjaya'), ('Desa Cibodas');

-- Insert sample kelompok
INSERT INTO kelompok (nama_kelompok, desa_id) VALUES 
  ('Kelompok Mawar', 1),
  ('Kelompok Melati', 1),
  ('Kelompok Anggrek', 2),
  ('Kelompok Dahlia', 3);

-- Insert admin user (password: admin123 -> md5)
-- md5('admin123') = 0192023a7bbd73250516f069df18b500
INSERT INTO users (username, nama, password, no_telp, role, desa_id) 
VALUES ('admin', 'Administrator', '0192023a7bbd73250516f069df18b500', '081234567890', 'KUadmin', 1);
