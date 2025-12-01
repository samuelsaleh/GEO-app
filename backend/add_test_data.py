"""
Add test data to the database for dashboard demo
"""
from datetime import datetime, timedelta
import random
from app.database import SessionLocal
from app.models.database import (
    VisibilityTest,
    WaitlistEntry,
    ContactSubmission,
    HealthCheckReport
)

def add_test_data():
    db = SessionLocal()

    # Clear existing test data (optional)
    print("Adding test data...")

    # Add Visibility Tests (most important for dashboard)
    test_brands = [
        ("Nike", 85, "fashion"),
        ("Shopify", 72, "saas"),
        ("Starbucks", 91, "food"),
        ("Tesla", 78, "automotive"),
        ("Airbnb", 88, "hospitality"),
        ("Peloton", 65, "fitness"),
        ("Stripe", 82, "fintech"),
        ("Notion", 74, "productivity"),
        ("Figma", 80, "design"),
        ("Slack", 87, "communication")
    ]

    for i, (brand, score, industry) in enumerate(test_brands):
        days_ago = random.randint(0, 7)
        grade = 'A' if score >= 90 else 'B' if score >= 80 else 'C' if score >= 70 else 'D' if score >= 60 else 'F'
        test = VisibilityTest(
            brand_name=brand,
            website_url=f"https://{brand.lower()}.com",
            industry=industry,
            overall_score=score,
            grade=grade,
            mention_rate=score / 100,
            total_tests=90,  # 15 prompts × 6 models
            total_mentions=int((score / 100) * 90),
            models_tested=["gpt-5.1", "claude-sonnet-4", "gemini-pro", "gpt-5.1-mini", "gemini-flash", "claude-3.5"],
            model_performance={
                "gpt-5.1": random.randint(60, 95),
                "claude-sonnet-4": random.randint(60, 95),
                "gemini-pro": random.randint(60, 95)
            },
            categories_tested=["recommendation", "comparison", "reputation"],
            category_scores={
                "recommendation": random.randint(60, 95),
                "comparison": random.randint(60, 95),
                "reputation": random.randint(60, 95)
            },
            top_competitors=[
                {"name": f"Competitor {j+1}", "score": random.randint(50, 90)}
                for j in range(3)
            ],
            user_rank=random.randint(1, 5),
            test_duration_seconds=random.uniform(30, 90),
            created_at=datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
        )
        db.add(test)

    # Add Waitlist Entries
    test_emails = [
        "sarah@techstartup.io",
        "mike@ecommerce.com",
        "lisa@marketingagency.co",
        "john@retailshop.com",
        "emma@saascompany.io",
        "david@consultingfirm.com",
        "sophia@creativestudio.design",
        "alex@foodbrand.com"
    ]

    for i, email in enumerate(test_emails):
        days_ago = random.randint(0, 14)
        entry = WaitlistEntry(
            email=email,
            position=i+1,
            status="pending",
            created_at=datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
        )
        db.add(entry)

    # Add Contact Submissions
    contacts = [
        ("Sarah Chen", "sarah@techstartup.io", "TechStart", "geo_audit", "Interested in full GEO audit for our SaaS platform", "new"),
        ("Mike Johnson", "mike@ecommerce.com", "ShopCo", "visibility_tool", "Want to understand our AI visibility score", "new"),
        ("Lisa Brown", "lisa@marketingagency.co", "Brand Agency", "consulting", "Looking for ongoing GEO consulting services", "contacted"),
        ("David Kim", "david@consultingfirm.com", "BizConsult", "other", "Partnership opportunity discussion", "new")
    ]

    for name, email, company, service, message, status in contacts:
        days_ago = random.randint(0, 10)
        contact = ContactSubmission(
            name=name,
            email=email,
            company=company,
            service=service,
            message=message,
            status=status,
            created_at=datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
        )
        db.add(contact)

    # Add Health Check Reports
    health_checks = [
        ("Example Startup", "contact@example-startup.com", 67),
        ("Retail Store Co", "hello@retail-store.com", 45),
        ("Tech Company", "team@tech-company.io", 82),
        ("Local Restaurant", "info@local-restaurant.com", 58)
    ]

    for company, email, score in health_checks:
        days_ago = random.randint(0, 12)
        report = HealthCheckReport(
            company_name=company,
            contact_email=email,
            overall_score=score,
            total_pages=random.randint(5, 20),
            pages_analyzed=[{"url": "/", "score": score}, {"url": "/about", "score": score + 5}],
            top_issues=[{"issue": "Missing schema markup", "severity": "high"}],
            top_strengths=[{"strength": "Good page speed", "impact": "medium"}],
            recommendations=["Add schema markup", "Improve meta descriptions"],
            ai_visibility={"score": score, "grade": "B"},
            created_at=datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
        )
        db.add(report)

    # Commit all changes
    db.commit()
    print(f"✅ Added test data:")
    print(f"   - {len(test_brands)} visibility tests")
    print(f"   - {len(test_emails)} waitlist entries")
    print(f"   - {len(contacts)} contact submissions")
    print(f"   - {len(health_checks)} health check reports")

    db.close()
    print("\n🎉 Test data added successfully! Refresh your dashboard at http://localhost:3000/admin")

if __name__ == "__main__":
    add_test_data()
