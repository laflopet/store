-- SQL script to update the database schema
-- Add display_name column to products_category table

-- Add display_name column
ALTER TABLE products_category ADD COLUMN display_name VARCHAR(100);

-- Populate display_name for existing records
UPDATE products_category 
SET display_name = CASE 
    WHEN name = 'hombres' THEN 'Hombres'
    WHEN name = 'mujeres' THEN 'Mujeres' 
    WHEN name = 'ninos' THEN 'Niños'
    WHEN name = 'bebes' THEN 'Bebés'
    ELSE name
END
WHERE display_name IS NULL OR display_name = '';

-- Add is_prepared column to orders_orderitem table
ALTER TABLE orders_orderitem ADD COLUMN is_prepared BOOLEAN DEFAULT FALSE;

-- Update migration records
INSERT OR IGNORE INTO django_migrations (app, name, applied) 
VALUES ('products', '0002_update_category_fields', datetime('now'));

INSERT OR IGNORE INTO django_migrations (app, name, applied) 
VALUES ('orders', '0003_add_is_prepared_field', datetime('now'));