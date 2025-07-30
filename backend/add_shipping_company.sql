-- Add shipping_company column to orders_order table
ALTER TABLE orders_order ADD COLUMN shipping_company VARCHAR(100) DEFAULT '';