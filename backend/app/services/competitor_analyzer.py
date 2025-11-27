"""Competitor analysis service"""
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
import re
import json
import logging
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)


class CompetitorAnalyzer:
    """Analyze and discover competitors using multi-provider AI"""
    
    def __init__(self):
        # Uses the multi-provider AI service (Claude, GPT-4o, Gemini)
        self.ai = ai_service
        logger.info(f"CompetitorAnalyzer using providers: {self.ai.get_available_providers()}")
    
    async def discover_competitors(
        self, 
        company_name: str, 
        website_url: str,
        industry_keywords: Optional[List[str]] = None
    ) -> List[Dict[str, str]]:
        """
        Use AI to discover potential competitors based on website content.
        
        Uses multi-provider AI (Claude, GPT-4o, Gemini) with automatic fallback.
        
        Returns list of competitor suggestions with name and URL
        """
        if not self.ai.is_available:
            logger.info("No AI providers available, returning empty competitor list")
            return []
        
        # First, analyze the user's website to understand their business
        business_context = await self._extract_business_context(website_url)
        
        # Use the multi-provider AI service
        competitors = await self.ai.analyze_competitors(
            company_name=company_name,
            website_url=website_url,
            business_context=business_context,
            industry_keywords=industry_keywords
        )
        
        logger.info(f"Discovered {len(competitors)} competitors for {company_name}")
        return competitors
    
    async def _extract_business_context(self, url: str) -> str:
        """Extract business context from a website"""
        try:
            async with httpx.AsyncClient(
                timeout=10.0,
                follow_redirects=True,
                headers={"User-Agent": "Mozilla/5.0 (compatible; DwightBot/1.0)"}
            ) as client:
                response = await client.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'lxml')
                
                # Remove scripts and styles
                for tag in soup(["script", "style", "noscript"]):
                    tag.decompose()
                
                # Extract key elements
                title = soup.find('title')
                title_text = title.get_text() if title else ""
                
                meta_desc = soup.find('meta', attrs={'name': 'description'})
                desc_text = meta_desc.get('content', '') if meta_desc else ""
                
                # Get main heading
                h1 = soup.find('h1')
                h1_text = h1.get_text() if h1 else ""
                
                # Get some body text
                body_text = soup.get_text(separator=' ', strip=True)[:1000]
                
                context = f"""
Title: {title_text}
Description: {desc_text}
Main Heading: {h1_text}
Content Preview: {body_text[:500]}
"""
                return context
                
        except Exception as e:
            logger.warning(f"Failed to extract business context from {url}: {e}")
            return f"Website: {url}"
    
    def generate_comparison_report(
        self,
        user_analysis: Dict[str, Any],
        competitor_analyses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate a comparison report between user and competitors
        """
        user_score = user_analysis.get("overall_score", 0)
        
        comparison = {
            "user_score": user_score,
            "competitors": [],
            "ranking": 1,  # User's rank among all
            "insights": [],
            "opportunities": []
        }
        
        all_scores = [user_score]
        
        for comp in competitor_analyses:
            comp_score = comp.get("overall_score", 0)
            all_scores.append(comp_score)
            
            diff = user_score - comp_score
            
            comparison["competitors"].append({
                "name": comp.get("name", "Competitor"),
                "url": comp.get("url", ""),
                "score": comp_score,
                "difference": diff,
                "status": "ahead" if diff > 0 else "behind" if diff < 0 else "tied",
                "has_schema": comp.get("has_schema", False),
                "has_faq": comp.get("has_faq", False),
                "top_strengths": comp.get("top_strengths", [])[:3]
            })
        
        # Calculate user ranking
        sorted_scores = sorted(all_scores, reverse=True)
        comparison["ranking"] = sorted_scores.index(user_score) + 1
        comparison["total_analyzed"] = len(all_scores)
        
        # Generate insights
        avg_competitor_score = sum(all_scores[1:]) / len(all_scores[1:]) if len(all_scores) > 1 else 0
        
        if user_score > avg_competitor_score:
            comparison["insights"].append(
                f"🎉 You're scoring {user_score - avg_competitor_score:.0f} points above your competitors' average!"
            )
        else:
            comparison["insights"].append(
                f"⚠️ You're {avg_competitor_score - user_score:.0f} points below your competitors' average. Time to optimize!"
            )
        
        # Check what competitors do better
        for comp in comparison["competitors"]:
            if comp["has_schema"] and not user_analysis.get("has_schema"):
                comparison["opportunities"].append(
                    f"{comp['name']} uses schema markup - add this to your site"
                )
            if comp["has_faq"] and not user_analysis.get("has_faq"):
                comparison["opportunities"].append(
                    f"{comp['name']} has FAQ content - consider adding FAQs"
                )
        
        # Rank-based insight
        if comparison["ranking"] == 1:
            comparison["insights"].append("🏆 You're #1 among analyzed competitors!")
        elif comparison["ranking"] == len(all_scores):
            comparison["insights"].append("📈 Room for improvement - you're currently last among competitors")
        else:
            comparison["insights"].append(f"📊 You rank #{comparison['ranking']} out of {len(all_scores)} sites analyzed")
        
        return comparison


# Singleton instance
competitor_analyzer = CompetitorAnalyzer()

