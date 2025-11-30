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
        subject = "Welcome to Dwight - You're on the Waitlist!"

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
                    <h1>Welcome to Dwight!</h1>
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
                    The Dwight Team</p>
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
                    The Dwight Team</p>
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


    def send_visibility_report(
        self,
        to_email: str,
        brand_name: str,
        overall_score: int,
        grade: str,
        category_results: list,
        strengths: list,
        weaknesses: list,
        recommendations: list,
        frontend_url: str = "http://localhost:3000"
    ) -> bool:
        """Send AI Visibility Score report email"""
        
        # Determine grade color
        grade_colors = {
            'A': '#10b981',  # green
            'B': '#3b82f6',  # blue
            'C': '#f59e0b',  # yellow
            'D': '#f97316',  # orange
            'F': '#ef4444',  # red
        }
        grade_color = grade_colors.get(grade, '#6b7280')
        
        # Build category breakdown HTML
        category_html = ""
        for cat in category_results:
            status_color = '#10b981' if cat['status'] == 'strong' else '#f59e0b' if cat['status'] == 'moderate' else '#ef4444'
            status_icon = '✅' if cat['status'] == 'strong' else '⚠️' if cat['status'] == 'moderate' else '❌'
            category_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{cat['categoryLabel']}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
                    <span style="color: {status_color}; font-weight: bold;">{cat['score']}%</span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">{status_icon}</td>
            </tr>
            """
        
        # Build strengths HTML
        strengths_html = "".join([f"<li style='margin: 8px 0;'>✅ {s['categoryLabel']} ({s['score']}%)</li>" for s in strengths]) if strengths else "<li>No strong categories yet</li>"
        
        # Build weaknesses HTML
        weaknesses_html = "".join([f"<li style='margin: 8px 0;'>❌ {w['categoryLabel']} ({w['score']}%)</li>" for w in weaknesses]) if weaknesses else "<li>No critical weaknesses</li>"
        
        # Build recommendations HTML
        recommendations_html = "".join([f"<li style='margin: 8px 0;'>{i+1}. {rec}</li>" for i, rec in enumerate(recommendations)])
        
        subject = f"Your AI Visibility Score: {overall_score}% (Grade {grade}) - {brand_name}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }}
                .score-circle {{ width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.2); display: inline-flex; align-items: center; justify-content: center; margin: 20px 0; }}
                .score {{ font-size: 48px; font-weight: bold; }}
                .grade {{ font-size: 28px; font-weight: bold; background: {grade_color}; padding: 5px 20px; border-radius: 20px; display: inline-block; margin-top: 10px; }}
                .content {{ background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px; }}
                .section {{ margin: 25px 0; padding: 20px; background: #f9fafb; border-radius: 8px; }}
                .section-title {{ font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 15px; }}
                .button {{ background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600; }}
                table {{ width: 100%; border-collapse: collapse; }}
                th {{ background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0 0 10px 0; font-size: 24px;">AI Visibility Report</h1>
                    <p style="margin: 0; opacity: 0.9;">{brand_name}</p>
                    <div class="score-circle">
                        <span class="score">{overall_score}%</span>
                    </div>
                    <div class="grade">Grade {grade}</div>
                </div>
                
                <div class="content">
                    <p style="font-size: 16px; color: #4b5563;">
                        Here's your AI visibility breakdown across 5 key query categories.
                        This shows how often AI mentions {brand_name} when users ask different types of questions.
                    </p>
                    
                    <div class="section">
                        <div class="section-title">📊 Category Breakdown</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th style="text-align: center;">Score</th>
                                    <th style="text-align: center;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {category_html}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="display: flex; gap: 20px;">
                        <div class="section" style="flex: 1; background: #ecfdf5;">
                            <div class="section-title" style="color: #065f46;">💪 Strengths</div>
                            <ul style="margin: 0; padding-left: 20px;">{strengths_html}</ul>
                        </div>
                        <div class="section" style="flex: 1; background: #fef2f2;">
                            <div class="section-title" style="color: #991b1b;">⚠️ Weaknesses</div>
                            <ul style="margin: 0; padding-left: 20px;">{weaknesses_html}</ul>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">🎯 Recommended Actions</div>
                        <ul style="margin: 0; padding-left: 20px;">{recommendations_html}</ul>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 25px; border-radius: 8px; color: white; margin-top: 25px;">
                        <h3 style="margin: 0 0 10px 0;">🔒 Want the Full Picture?</h3>
                        <p style="margin: 0 0 15px 0; opacity: 0.9;">
                            This report tested 2 AI models. Upgrade to test all 6 models, see competitor rankings, and get a detailed action plan.
                        </p>
                        <a href="{frontend_url}/pricing" style="background: white; color: #7c3aed; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                            Get Full Report - €97 →
                        </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
                        Questions? Just reply to this email.<br>
                        — The Creed Team
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, html_content)

    def send_quick_check_results(
        self,
        to_email: str,
        brand: str,
        score: int,
        grade: str,
        frontend_url: str = "http://localhost:3000"
    ) -> bool:
        """Send quick check results email with upgrade offer"""
        
        grade_colors = {'A': '#10b981', 'B': '#3b82f6', 'C': '#f59e0b', 'D': '#f97316', 'F': '#ef4444'}
        grade_color = grade_colors.get(grade, '#6b7280')
        
        if score >= 70:
            status_message = "🟢 You have good visibility!"
            status_detail = "AI recommends your brand in most cases."
        elif score >= 40:
            status_message = "🟡 Moderate visibility"
            status_detail = "Room for improvement - competitors may appear more often."
        else:
            status_message = "🔴 Low visibility"
            status_detail = f"{100 - score}% of potential customers asking AI won't hear about you."
        
        subject = f"Your AI Visibility Score: {score}% (Grade: {grade})"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .score {{ font-size: 48px; font-weight: bold; margin: 10px 0; }}
                .grade {{ background: {grade_color}; padding: 5px 15px; border-radius: 15px; display: inline-block; }}
                .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
                .cta-button {{ background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }}
                .insight {{ background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #7c3aed; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Your AI Visibility Results</h1>
                    <div class="score">{score}%</div>
                    <div class="grade">Grade: {grade}</div>
                </div>
                
                <div class="content">
                    <h2>Hi there,</h2>
                    <p>We tested how often AI search engines mention <strong>{brand}</strong> when asked about your category.</p>
                    
                    <div class="insight">
                        <strong>{status_message}</strong><br>
                        {status_detail}
                    </div>
                    
                    <h3>Want to know more?</h3>
                    <p>This was just a quick check with 2 AI models. Here's what you're missing:</p>
                    <ul>
                        <li>🔒 Test across all 6 major AI models</li>
                        <li>🔒 See how you rank vs 10 competitors</li>
                        <li>🔒 Detailed breakdown by query type</li>
                        <li>🔒 Specific recommendations to improve</li>
                    </ul>
                    
                    <center>
                        <a href="{frontend_url}/pricing" class="cta-button">
                            Get Full Competitive Report - €97
                        </a>
                    </center>
                    
                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        Questions? Just reply to this email.<br>
                        - The Creed Team
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, html_content)


# Singleton instance
email_service = EmailService()
