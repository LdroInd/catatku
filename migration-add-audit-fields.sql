-- =============================================
-- Migration: Tambah kolom audit (created_by, last_updated_by, last_updated_date)
-- Jalankan script ini di database yang sudah ada
-- =============================================

-- pencatatan_header: tambah last_updated_by dan last_updated_date
ALTER TABLE pencatatan_header 
  ADD COLUMN IF NOT EXISTS last_updated_by INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS last_updated_date TIMESTAMP;

-- pencatatan_detail: tambah created_by, last_updated_by, dan last_updated_date
ALTER TABLE pencatatan_detail 
  ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS last_updated_by INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS last_updated_date TIMESTAMP;
