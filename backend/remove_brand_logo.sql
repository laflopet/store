-- Remove logo column from products_brand table
-- SQLite doesn't support DROP COLUMN directly, so we need to recreate the table

-- Create temporary table with new structure
CREATE TABLE products_brand_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1
);

-- Copy data from old table to new table
INSERT INTO products_brand_new (id, name, description, is_active)
SELECT id, name, description, is_active FROM products_brand;

-- Drop old table
DROP TABLE products_brand;

-- Rename new table to original name
ALTER TABLE products_brand_new RENAME TO products_brand;