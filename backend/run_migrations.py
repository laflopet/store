#!/usr/bin/env python
"""
Simple migration runner script
Run this with: python run_migrations.py
"""
import os
import sys
import django
from django.conf import settings
from django.core.management import execute_from_command_line

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'store.settings')

# Setup Django
django.setup()

# Import migration commands
from django.core.management.commands.migrate import Command as MigrateCommand
from django.db import connection

def run_sql_migration():
    """Run the migrations using direct SQL"""
    cursor = connection.cursor()
    
    print("Running Category model migrations...")
    
    # Add display_name column to products_category
    try:
        cursor.execute("ALTER TABLE products_category ADD COLUMN display_name VARCHAR(100);")
        print("✓ Added display_name column")
    except Exception as e:
        print(f"Display_name column might already exist: {e}")
    
    # Populate display_name for existing records
    try:
        cursor.execute("""
            UPDATE products_category 
            SET display_name = CASE 
                WHEN name = 'hombres' THEN 'Hombres'
                WHEN name = 'mujeres' THEN 'Mujeres' 
                WHEN name = 'ninos' THEN 'Niños'
                WHEN name = 'bebes' THEN 'Bebés'
                ELSE name
            END
            WHERE display_name IS NULL;
        """)
        print("✓ Populated display_name values")
    except Exception as e:
        print(f"Error populating display_name: {e}")
    
    # Add is_prepared column to orders_orderitem
    try:
        cursor.execute("ALTER TABLE orders_orderitem ADD COLUMN is_prepared BOOLEAN DEFAULT FALSE;")
        print("✓ Added is_prepared column to OrderItem")
    except Exception as e:
        print(f"is_prepared column might already exist: {e}")
    
    print("Migrations completed!")

if __name__ == "__main__":
    run_sql_migration()