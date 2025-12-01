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
