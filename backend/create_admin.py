#!/usr/bin/env python3
"""
Script to create an admin user in the database.
Can be run locally or in production (Railway).

Usage:
    python create_admin.py

Or with custom values:
    python create_admin.py --email admin@example.com --password mypassword
"""

import sys
import os

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, init_db
from app.models.database import User
from app.auth import hash_password
import argparse


def create_admin_user(email: str, password: str, full_name: str = None):
    """Create an admin user in the database"""

    # Initialize database (creates tables if they don't exist)
    print("🔄 Initializing database...")
    init_db()

    db = SessionLocal()

    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user:
            # Update existing user to be admin
            existing_user.is_admin = True
            existing_user.is_active = True
            db.commit()
            print(f"✅ User {email} already exists - upgraded to admin!")
            return

        # Create new admin user
        admin_user = User(
            email=email,
            hashed_password=hash_password(password),
            full_name=full_name,
            is_admin=True,
            is_active=True,
            subscription_tier="premium"  # Give admins premium by default
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print(f"""
✅ Admin user created successfully!

📧 Email: {email}
🔑 Password: {password}
👑 Admin: Yes
📦 Tier: premium

You can now log in at:
- Local: http://localhost:3000/login
- Production: https://miageru-geo.com/login
        """)

    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create admin user")
    parser.add_argument("--email", default="admin@miageru-geo.com", help="Admin email")
    parser.add_argument("--password", default="changeme123", help="Admin password")
    parser.add_argument("--name", default="Admin", help="Full name")

    args = parser.parse_args()

    print("""
╔════════════════════════════════════════════════╗
║     Miageru Admin User Creator                 ║
╚════════════════════════════════════════════════╝
    """)

    # Warn if using default password
    if args.password == "changeme123":
        print("⚠️  WARNING: Using default password. Change it after first login!")
        print()

    create_admin_user(args.email, args.password, args.name)
