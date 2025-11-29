"""
Simple Competitive Test Service
Runs quick visibility checks (free tier) - 3 prompts, 1 AI model
"""

import re
from typing import List, Dict, Optional
from datetime import datetime
import httpx
from anthropic import Anthropic
import os

from .prompt_generator import prompt_generator


class SimpleCompetitiveTest:
    """Runs simple 3-prompt visibility test for free tier"""

    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.anthropic_key:
            print("Warning: ANTHROPIC_API_KEY not set - using demo data")

    async def run_quick_check(
        self,
        brand_name: str,
        category: str,
        competitors: Optional[List[str]] = None
    ) -> Dict:
        """
        Run quick visibility check (FREE tier)

        Args:
            brand_name: The user's brand to test
            category: Product category (e.g., "CRM software")
            competitors: Optional list of competitors (for paid tier)

        Returns:
            Dict with visibility results
        """
        # Generate 3 strategic prompts
        prompts = prompt_generator.generate_free_tier_prompts(category)

        # Run each prompt through Claude
        results = []
        mention_count = 0

        for prompt_data in prompts:
            prompt_text = prompt_data["prompt"]

            # Get AI response
            response_text = await self._query_ai(prompt_text)

            # Check if brand is mentioned
            is_mentioned = self._is_brand_mentioned(brand_name, response_text)

            if is_mentioned:
                mention_count += 1

            results.append({
                "prompt_category": prompt_data["category"],
                "mentioned": is_mentioned,
                "response_preview": response_text[:200] + "..." if len(response_text) > 200 else response_text
            })

        # Calculate visibility score
        visibility_percentage = int((mention_count / len(prompts)) * 100)

        # Determine grade
        grade = self._calculate_grade(visibility_percentage)

        # Generate insights
        insights = self._generate_insights(
            visibility_percentage,
            mention_count,
            len(prompts),
            results
        )

        return {
            "brand": brand_name,
            "category": category,
            "visibility_score": visibility_percentage,
            "grade": grade,
            "mentions": mention_count,
            "total_prompts": len(prompts),
            "insights": insights,
            "upgrade_message": self._get_upgrade_message(visibility_percentage),
            "tested_at": datetime.utcnow().isoformat(),
            "tier": "free"
        }

    async def _query_ai(self, prompt: str) -> str:
        """Query Claude AI with a prompt"""
        if not self.anthropic_key:
            # Demo mode - return placeholder
            return "Demo response: Various options are available including popular brands in this category."

        try:
            client = Anthropic(api_key=self.anthropic_key)
            message = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return message.content[0].text
        except Exception as e:
            print(f"Error querying AI: {e}")
            return "Error getting AI response"

    def _is_brand_mentioned(self, brand_name: str, response: str) -> bool:
        """
        Check if brand is mentioned in AI response
        Uses fuzzy matching to catch variations
        """
        # Normalize
        brand_lower = brand_name.lower()
        response_lower = response.lower()

        # Direct match
        if brand_lower in response_lower:
            return True

        # Check for partial matches (e.g., "Salesforce" in "Salesforce CRM")
        brand_words = brand_lower.split()
        for word in brand_words:
            if len(word) > 3:  # Ignore short words like "the", "and"
                if word in response_lower:
                    return True

        return False

    def _calculate_grade(self, percentage: int) -> str:
        """Calculate letter grade from visibility percentage"""
        if percentage >= 90:
            return "A"
        elif percentage >= 75:
            return "B"
        elif percentage >= 60:
            return "C"
        elif percentage >= 40:
            return "D"
        else:
            return "F"

    def _generate_insights(
        self,
        visibility: int,
        mentions: int,
        total: int,
        results: List[Dict]
    ) -> List[str]:
        """Generate actionable insights from test results"""
        insights = []

        # Overall visibility insight
        if visibility < 40:
            insights.append(f"🔴 Critical: Your brand appears in only {mentions} out of {total} AI responses ({visibility}%)")
            insights.append(f"This means {100 - visibility}% of potential customers asking AI won't hear about you")
        elif visibility < 70:
            insights.append(f"🟡 Warning: Your brand appears in {mentions} out of {total} AI responses ({visibility}%)")
            insights.append(f"You're visible but not competitive - {100 - visibility}% of queries miss you")
        else:
            insights.append(f"🟢 Good: Your brand appears in {mentions} out of {total} AI responses ({visibility}%)")
            insights.append("Your visibility is strong, but there's room to dominate")

        # Category-specific insights
        recommendation_mentioned = any(
            r["mentioned"] for r in results if r["prompt_category"] == "recommendation"
        )
        comparison_mentioned = any(
            r["mentioned"] for r in results if r["prompt_category"] == "comparison"
        )

        if not recommendation_mentioned:
            insights.append("❌ Never mentioned in direct recommendation queries (high-intent buyers)")
        if not comparison_mentioned:
            insights.append("❌ Missing from comparison queries (research phase)")

        return insights

    def _get_upgrade_message(self, visibility: int) -> str:
        """Get contextual upgrade message based on score"""
        if visibility < 40:
            return "Want to know how you compare to competitors? Upgrade to see your ranking vs. 10 competitors."
        elif visibility < 70:
            return "See how your competitors are beating you. Get the full competitive analysis for €97."
        else:
            return "You're doing well! See your exact ranking and find gaps to become #1."


# Singleton instance
simple_competitive_test = SimpleCompetitiveTest()
