"""
Create database tables for the visibility tool.

Run this script once to create the visibility_tests table:
    python create_tables.py
"""

from app.database import init_db, engine
from app.models.database import Base, VisibilityTest
from sqlalchemy import inspect

def main():
    print("Creating database tables...")

    # Check if table already exists
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    if "visibility_tests" in existing_tables:
        print("✅ visibility_tests table already exists")
    else:
        print("📦 Creating visibility_tests table...")
        Base.metadata.create_all(bind=engine)
        print("✅ visibility_tests table created successfully!")

    print("\nDatabase is ready!")
    print("The app will now track:")
    print("  • Brand visibility tests")
    print("  • Overall scores and grades")
    print("  • Competitor rankings")
    print("  • Model performance")
    print("  • User analytics")

if __name__ == "__main__":
    main()
