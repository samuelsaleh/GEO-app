"""
Admin Dashboard API

Endpoints for monitoring product usage and analytics.

🔒 ALL ENDPOINTS REQUIRE ADMIN AUTHENTICATION
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import func, desc
from typing import List, Dict, Any
import logging

from app.database import SessionLocal
from app.models.database import (
    VisibilityTest,
    WaitlistEntry,
    ContactSubmission,
    HealthCheckReport,
    User
)
from app.auth import get_current_admin_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/stats")
async def get_dashboard_stats(current_admin: User = Depends(get_current_admin_user)):
    """
    Get high-level dashboard statistics

    Returns:
    - Total visibility tests
    - Total waitlist signups
    - Total health check reports
    - Total contact submissions
    - Average visibility score
    - Tests by day (last 7 days)
    """
    try:
        db = SessionLocal()

        # Total counts
        total_tests = db.query(func.count(VisibilityTest.id)).scalar() or 0
        total_waitlist = db.query(func.count(WaitlistEntry.id)).scalar() or 0
        total_health_checks = db.query(func.count(HealthCheckReport.id)).scalar() or 0
        total_contacts = db.query(func.count(ContactSubmission.id)).scalar() or 0

        # Average score
        avg_score = db.query(func.avg(VisibilityTest.overall_score)).scalar()
        avg_score = round(avg_score) if avg_score else 0

        # Tests per day (last 7 days)
        from datetime import datetime, timedelta
        seven_days_ago = datetime.utcnow() - timedelta(days=7)

        daily_tests = db.query(
            func.date(VisibilityTest.created_at).label('date'),
            func.count(VisibilityTest.id).label('count')
        ).filter(
            VisibilityTest.created_at >= seven_days_ago
        ).group_by(
            func.date(VisibilityTest.created_at)
        ).all()

        db.close()

        return {
            "total_tests": total_tests,
            "total_waitlist": total_waitlist,
            "total_health_checks": total_health_checks,
            "total_contacts": total_contacts,
            "average_score": avg_score,
            "daily_tests": [
                {"date": str(day.date), "count": day.count}
                for day in daily_tests
            ]
        }

    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/visibility-tests")
async def get_visibility_tests(limit: int = 50, current_admin: User = Depends(get_current_admin_user)):
    """
    Get recent visibility tests

    Returns list of tests with:
    - Brand name
    - Overall score
    - Created date
    - Number of categories tested
    """
    try:
        db = SessionLocal()

        tests = db.query(VisibilityTest).order_by(
            desc(VisibilityTest.created_at)
        ).limit(limit).all()

        results = []
        for test in tests:
            # Count how many models were tested
            models_count = len(test.models_tested) if test.models_tested else 0

            results.append({
                "id": test.id,
                "brand_name": test.brand_name,
                "overall_score": test.overall_score,
                "created_at": test.created_at.isoformat() if test.created_at else None,
                "models_tested": models_count
            })

        db.close()

        return {"tests": results, "total": len(results)}

    except Exception as e:
        logger.error(f"Error fetching visibility tests: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/waitlist")
async def get_waitlist(limit: int = 100, current_admin: User = Depends(get_current_admin_user)):
    """Get waitlist signups"""
    try:
        db = SessionLocal()

        entries = db.query(WaitlistEntry).order_by(
            desc(WaitlistEntry.created_at)
        ).limit(limit).all()

        results = []
        for i, entry in enumerate(entries, 1):
            results.append({
                "position": i,
                "email": entry.email,
                "timestamp": entry.created_at.isoformat() if entry.created_at else None
            })

        db.close()

        return {"entries": results, "total": len(results)}

    except Exception as e:
        logger.error(f"Error fetching waitlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health-checks")
async def get_health_checks(limit: int = 50, current_admin: User = Depends(get_current_admin_user)):
    """Get health check report submissions"""
    try:
        db = SessionLocal()

        reports = db.query(HealthCheckReport).order_by(
            desc(HealthCheckReport.created_at)
        ).limit(limit).all()

        results = []
        for report in reports:
            results.append({
                "company_name": report.website_url,  # Using URL as identifier
                "contact_email": "N/A",  # Not stored in health check reports
                "score": report.overall_score,
                "status": "completed",
                "submitted_at": report.created_at.isoformat() if report.created_at else None
            })

        db.close()

        return {"reports": results, "total": len(results)}

    except Exception as e:
        logger.error(f"Error fetching health checks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/contacts")
async def get_contact_submissions(limit: int = 50, current_admin: User = Depends(get_current_admin_user)):
    """Get contact form submissions"""
    try:
        db = SessionLocal()

        contacts = db.query(ContactSubmission).order_by(
            desc(ContactSubmission.created_at)
        ).limit(limit).all()

        results = []
        for contact in contacts:
            results.append({
                "id": contact.id,
                "name": contact.name,
                "email": contact.email,
                "company": contact.company,
                "service": contact.service_type,
                "message": contact.message,
                "status": contact.status,
                "created_at": contact.created_at.isoformat() if contact.created_at else None
            })

        db.close()

        return {"contacts": results, "total": len(results)}

    except Exception as e:
        logger.error(f"Error fetching contacts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/popular-brands")
async def get_popular_brands(limit: int = 10, current_admin: User = Depends(get_current_admin_user)):
    """Get most tested brands"""
    try:
        db = SessionLocal()

        popular = db.query(
            VisibilityTest.brand_name,
            func.count(VisibilityTest.id).label('test_count'),
            func.avg(VisibilityTest.overall_score).label('avg_score')
        ).group_by(
            VisibilityTest.brand_name
        ).order_by(
            desc('test_count')
        ).limit(limit).all()

        results = []
        for brand in popular:
            results.append({
                "brand": brand.brand_name,
                "tests": brand.test_count,
                "avg_score": round(brand.avg_score) if brand.avg_score else 0
            })

        db.close()

        return {"brands": results}

    except Exception as e:
        logger.error(f"Error fetching popular brands: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users")
async def get_users(limit: int = 100, current_admin: User = Depends(get_current_admin_user)):
    """
    Get all registered users

    Returns list of users with:
    - Email
    - Full name
    - Company
    - Subscription tier
    - Admin status
    - Account status (active/inactive)
    - Registration date
    - Last login
    """
    try:
        db = SessionLocal()

        users = db.query(User).order_by(
            desc(User.created_at)
        ).limit(limit).all()

        results = []
        for user in users:
            results.append({
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "company": user.company,
                "subscription_tier": user.subscription_tier,
                "is_admin": user.is_admin,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "last_login": user.last_login.isoformat() if user.last_login else None
            })

        db.close()

        return {"users": results, "total": len(results)}

    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user-analytics")
async def get_user_analytics(current_admin: User = Depends(get_current_admin_user)):
    """
    Get user analytics and trends

    Returns:
    - Total users
    - Active users (logged in last 30 days)
    - New signups (last 7 days)
    - Users by subscription tier
    - Signups per day (last 30 days)
    """
    try:
        from datetime import datetime, timedelta
        db = SessionLocal()

        # Total users
        total_users = db.query(func.count(User.id)).scalar() or 0

        # Active users (logged in last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_users = db.query(func.count(User.id)).filter(
            User.last_login >= thirty_days_ago
        ).scalar() or 0

        # New signups (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        new_signups = db.query(func.count(User.id)).filter(
            User.created_at >= seven_days_ago
        ).scalar() or 0

        # Users by subscription tier
        tier_counts = db.query(
            User.subscription_tier,
            func.count(User.id).label('count')
        ).group_by(User.subscription_tier).all()

        tiers = {tier.subscription_tier: tier.count for tier in tier_counts}

        # Signups per day (last 30 days)
        daily_signups = db.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('count')
        ).filter(
            User.created_at >= thirty_days_ago
        ).group_by(
            func.date(User.created_at)
        ).all()

        db.close()

        return {
            "total_users": total_users,
            "active_users": active_users,
            "new_signups_7d": new_signups,
            "users_by_tier": tiers,
            "daily_signups": [
                {"date": str(day.date), "count": day.count}
                for day in daily_signups
            ]
        }

    except Exception as e:
        logger.error(f"Error fetching user analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))
