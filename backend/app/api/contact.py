"""Contact form API endpoint"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import json
import os
from app.services.email_service import email_service
from app.config import settings

router = APIRouter()


class ContactRequest(BaseModel):
    """Contact form submission model"""
    name: str
    email: EmailStr
    company: Optional[str] = None
    service: str
    message: str


class ContactResponse(BaseModel):
    """Contact form response model"""
    success: bool
    message: str


@router.post("/submit", response_model=ContactResponse)
async def submit_contact(request: ContactRequest, background_tasks: BackgroundTasks):
    """
    Handle contact form submissions
    
    - Saves submission to JSON file (later: database)
    - Sends notification email to admin
    - Sends confirmation email to user
    """
    try:
        # Save to JSON file (temporary - later use database)
        submissions_file = "contact_submissions.json"
        submissions = []
        
        if os.path.exists(submissions_file):
            with open(submissions_file, 'r') as f:
                submissions = json.load(f)
        
        submission = {
            "id": len(submissions) + 1,
            "name": request.name,
            "email": request.email,
            "company": request.company or "Not provided",
            "service": request.service,
            "message": request.message,
            "timestamp": datetime.now().isoformat(),
            "status": "new"
        }
        
        submissions.append(submission)
        
        with open(submissions_file, 'w') as f:
            json.dump(submissions, f, indent=2)
        
        # Send notification to admin in background
        if settings.admin_email:
            background_tasks.add_task(
                email_service.send_contact_form_notification,
                settings.admin_email,
                request.name,
                request.email,
                request.company or "Not provided",
                request.service,
                request.message
            )
        
        # Send confirmation to user
        background_tasks.add_task(
            send_contact_confirmation,
            request.email,
            request.name
        )
        
        return ContactResponse(
            success=True,
            message="Thank you for your message! We'll get back to you within 24 hours."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit contact form: {str(e)}")


async def send_contact_confirmation(email: str, name: str):
    """Send confirmation email to user"""
    subject = "We received your message - Dwight"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }}
            .header h1 {{ margin: 0; font-size: 28px; letter-spacing: -0.5px; }}
            .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }}
            .highlight {{ background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #06b6d4; margin: 20px 0; }}
            .footer {{ text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Message Received!</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                
                <p>Thanks for reaching out to us! We've received your message and our team will review it shortly.</p>
                
                <div class="highlight">
                    <strong>What happens next?</strong>
                    <ul>
                        <li>Our team reviews your inquiry within 24 hours</li>
                        <li>We'll send you a personalized response</li>
                        <li>For urgent matters, we prioritize faster turnaround</li>
                    </ul>
                </div>
                
                <p>In the meantime, feel free to explore our free tools:</p>
                <ul>
                    <li><a href="{settings.frontend_url}/tools/health-check">AI Visibility Health Check</a></li>
                    <li><a href="{settings.frontend_url}/tools/schema-generator">Schema Generator</a></li>
                </ul>
                
                <p>Best regards,<br>
                <strong>The Dwight Team</strong></p>
            </div>
            <div class="footer">
                <p>© 2024 Dwight. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    email_service.send_email(email, subject, html_content)


@router.get("/test")
async def test_contact():
    """Test endpoint"""
    return {"status": "ok", "message": "Contact API is working"}


