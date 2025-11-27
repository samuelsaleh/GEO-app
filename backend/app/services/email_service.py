import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import os
from typing import List, Optional

class EmailService:
    """Service for sending emails"""

    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', self.smtp_user)

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        attachments: Optional[List[dict]] = None
    ) -> bool:
        """
        Send an email

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            attachments: List of dicts with 'filename' and 'content' keys

        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email

            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)

            # Add attachments if any
            if attachments:
                for attachment in attachments:
                    part = MIMEApplication(attachment['content'])
                    part.add_header(
                        'Content-Disposition',
                        'attachment',
                        filename=attachment['filename']
                    )
                    msg.attach(part)

            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                if self.smtp_user and self.smtp_password:
                    server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            return True

        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

    def send_waitlist_confirmation(self, to_email: str, position: int) -> bool:
        """Send waitlist confirmation email"""
        subject = "Welcome to Creed - You're on the Waitlist!"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(to right, #0284c7, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ background: #0284c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }}
                .stats {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Creed!</h1>
                </div>
                <div class="content">
                    <p>Hi there!</p>

                    <p>Thanks for joining our waitlist! You're in position <strong>#{position}</strong>.</p>

                    <div class="stats">
                        <h3>🎉 What You Get Early Access To:</h3>
                        <ul>
                            <li>AI Visibility Health-Check tool</li>
                            <li>Schema Generator for all content types</li>
                            <li>Exclusive early-bird pricing</li>
                            <li>Priority support</li>
                        </ul>
                    </div>

                    <p>While you wait, try our <strong>free tools</strong>:</p>

                    <a href="http://localhost:3000/tools/health-check" class="button">
                        Try Health Check →
                    </a>

                    <a href="http://localhost:3000/tools/schema-generator" class="button">
                        Use Schema Generator →
                    </a>

                    <p>We'll notify you as soon as we launch!</p>

                    <p>Best regards,<br>
                    The Creed Team</p>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(to_email, subject, html_content)

    def send_health_check_report(
        self,
        to_email: str,
        company_name: str,
        score: int,
        report_url: Optional[str] = None
    ) -> bool:
        """Send health check report email"""
        subject = f"Your AI Visibility Report is Ready - Score: {score}/100"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(to right, #0284c7, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }}
                .score {{ font-size: 48px; font-weight: bold; color: {'#10b981' if score >= 70 else '#f59e0b' if score >= 40 else '#ef4444'}; text-align: center; margin: 20px 0; }}
                .button {{ background: #0284c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Your AI Visibility Report</h1>
                </div>
                <div class="content">
                    <p>Hi {company_name},</p>

                    <p>Your AI Visibility Health-Check is complete!</p>

                    <div class="score">
                        {score}/100
                    </div>

                    <p style="text-align: center; font-size: 18px; margin-bottom: 30px;">
                        {'🎉 Great job!' if score >= 70 else '⚠️ Room for improvement' if score >= 40 else '🚨 Needs attention'}
                    </p>

                    <h3>What's Next?</h3>
                    <ul>
                        <li>Review your detailed report with screenshots</li>
                        <li>Check the top 5 recommendations</li>
                        <li>Implement the quick wins first</li>
                        <li>Schedule a follow-up check in 30 days</li>
                    </ul>

                    {'<a href="' + report_url + '" class="button">View Full Report →</a>' if report_url else ''}

                    <p>Questions? Just reply to this email.</p>

                    <p>Best regards,<br>
                    The Creed Team</p>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(to_email, subject, html_content)

    def send_contact_form_notification(
        self,
        admin_email: str,
        name: str,
        email: str,
        company: str,
        service: str,
        message: str
    ) -> bool:
        """Send notification to admin when contact form is submitted"""
        subject = f"New Contact Form: {service} - {company}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .info {{ background: #f1f5f9; padding: 15px; border-left: 4px solid #0284c7; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>New Contact Form Submission</h2>

                <div class="info">
                    <strong>Name:</strong> {name}<br>
                    <strong>Email:</strong> {email}<br>
                    <strong>Company:</strong> {company}<br>
                    <strong>Service:</strong> {service}
                </div>

                <h3>Message:</h3>
                <p>{message}</p>

                <hr>
                <p><small>Reply directly to this email to contact {name}</small></p>
            </div>
        </body>
        </html>
        """

        return self.send_email(admin_email, subject, html_content)


# Singleton instance
email_service = EmailService()
