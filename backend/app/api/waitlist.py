from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from datetime import datetime
import json
import os
from app.services.email_service import email_service

router = APIRouter()

class WaitlistEntry(BaseModel):
    email: EmailStr

@router.post("/join")
async def join_waitlist(entry: WaitlistEntry, background_tasks: BackgroundTasks):
    """Add email to waitlist"""
    try:
        # For now, just save to a JSON file (later: save to database)
        waitlist_file = "waitlist.json"

        waitlist = []
        if os.path.exists(waitlist_file):
            with open(waitlist_file, 'r') as f:
                waitlist = json.load(f)

        # Check if email already exists
        if any(item['email'] == entry.email for item in waitlist):
            return {
                "success": True,
                "message": "You're already on the waitlist!",
                "position": next(i for i, item in enumerate(waitlist) if item['email'] == entry.email) + 1
            }

        # Add new entry
        waitlist.append({
            "email": entry.email,
            "timestamp": datetime.now().isoformat(),
            "position": len(waitlist) + 1
        })

        with open(waitlist_file, 'w') as f:
            json.dump(waitlist, f, indent=2)

        # Send confirmation email in background
        position = len(waitlist)
        background_tasks.add_task(
            email_service.send_waitlist_confirmation,
            entry.email,
            position
        )

        return {
            "success": True,
            "message": "Successfully joined the waitlist!",
            "position": position
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
