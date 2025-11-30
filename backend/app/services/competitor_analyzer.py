"""Competitor analysis service"""
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
import re
import json
import logging
from pydantic import BaseModel
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)


class CompanySize(BaseModel):
    """Company size classification"""
    category: str  # "micro" | "small" | "medium" | "large"
    description: str  # e.g., "<10 employees, <€2M revenue"
    estimated_employees: Optional[str] = None  # e.g., "10-50"
    estimated_revenue: Optional[str] = None  # e.g., "€2M-€10M"


class CompetitorSuggestion(BaseModel):
    """A suggested competitor with size classification"""
    name: str
    website: Optional[str] = None
    scope: str  # "local" or "global"
    reason: str
    company_size: Optional[CompanySize] = None


class CompetitorDiscoveryResult(BaseModel):
    """Result of competitor discovery"""
    brand: str
    category: str
    location: Optional[str] = None
    local_competitors: List[CompetitorSuggestion] = []
    global_competitors: List[CompetitorSuggestion] = []
    total_found: int = 0
    size_breakdown: dict = {}  # Count by size category


class CompetitorAnalyzer:
    """Analyze and discover competitors using multi-provider AI"""
    
    def __init__(self):
        # Uses the multi-provider AI service (Claude, GPT-5.1, Gemini)
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
        
        Uses multi-provider AI (Claude, GPT-5.1, Gemini) with automatic fallback.
        
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

    async def discover_top_competitors(
        self,
        brand: str,
        category: str,
        location: Optional[str] = None,
        website_url: Optional[str] = None
    ) -> CompetitorDiscoveryResult:
        """
        Discover competitors for a brand based on their category and location.
        
        Uses a simplified prompt that focuses on category-based discovery,
        which works better for local/niche brands that AI may not know directly.
        
        Priority order:
        1. Claude Sonnet 4 (best for analysis)
        2. Gemini 2.5 Flash (fallback)
        3. Any available provider
        
        Args:
            brand: The brand name to find competitors for
            category: Product/service category (e.g., "fashion clothing", "running shoes")
            location: Optional location for local competitors (e.g., "France", "New York")
            website_url: Optional website URL for additional context
            
        Returns:
            CompetitorDiscoveryResult with local and global competitors
        """
        if not self.ai.is_available:
            logger.warning("No AI providers available for competitor discovery")
            return CompetitorDiscoveryResult(brand=brand, category=category, location=location)
        
        # Build the prompt for competitor discovery - simplified and more reliable
        location_context = f" in {location}" if location else ""
        website_context = f"\nWebsite: {website_url}" if website_url else ""
        
        prompt = f"""Find competitors for this business:

Brand: {brand}{website_context}
Category: {category}
Location: {location if location else "Global"}

Based on this brand and what they do, list 5-10 competitors that:
1. Operate in the same {category} space{location_context}
2. Would be alternatives someone might consider instead of {brand}
3. Mix of well-known players and smaller/local alternatives

For each competitor provide:
- name: Brand name
- website: URL (or null if unknown)
- scope: "local" or "global"
- reason: One sentence why they compete with {brand}

Return as JSON:
{{
    "local_competitors": [
        {{"name": "...", "website": "...", "reason": "..."}}
    ],
    "global_competitors": [
        {{"name": "...", "website": "...", "reason": "..."}}
    ]
}}

IMPORTANT:
- These should be real alternatives to {brand} in the {category} market
- It's OK to return fewer competitors if you're not confident
- Only include brands you're certain exist
- Do NOT include {brand} itself
- Return valid JSON only, no markdown code blocks"""

        system_prompt = """You are a market research expert. Find real competitors based on the category and market.
Focus on brands that actually exist and compete in the same space.
Always return valid JSON only."""

        available_providers = self.ai.get_available_providers()
        response = None

        try:
            # 1. Try Claude Sonnet 4 first (best for analysis)
            if "anthropic" in available_providers:
                logger.info("🧠 Trying Claude Sonnet 4 for competitor discovery...")
                try:
                    response = await self.ai.generate_with_model(
                        prompt=prompt,
                        system_prompt=system_prompt,
                        model="claude-sonnet-4-20250514",
                        provider="anthropic",
                        max_tokens=3000,
                        temperature=0.3
                    )
                    if response:
                        logger.info("✅ Claude Sonnet 4 responded successfully")
                except Exception as e:
                    logger.warning(f"❌ Claude failed: {e}")
                    response = None
            
            # 2. Fallback to Gemini 2.5 Flash
            if not response and "google" in available_providers:
                logger.info("💎 Trying Gemini 2.5 Flash for competitor discovery...")
                try:
                    response = await self.ai.generate_with_model(
                        prompt=prompt,
                        system_prompt=system_prompt,
                        model="gemini-2.5-flash",
                        provider="google",
                        max_tokens=3000,
                        temperature=0.3
                    )
                    if response:
                        logger.info("✅ Gemini 2.5 Flash responded successfully")
                except Exception as e:
                    logger.warning(f"❌ Gemini failed: {e}")
                    response = None
            
            # 3. Final fallback to any available provider
            if not response:
                logger.info("🤖 Using default AI provider for competitor discovery...")
                response = await self.ai.generate(
                    prompt=prompt,
                    system_prompt=system_prompt,
                    max_tokens=3000,
                    temperature=0.3
                )
            
            if not response:
                logger.warning("No response from any AI provider for competitor discovery")
                return CompetitorDiscoveryResult(brand=brand, category=category, location=location)
            
            # Parse the JSON response
            result = self._parse_competitor_response(response, brand, category, location)
            logger.info(f"Discovered {result.total_found} competitors for {brand}")
            return result
            
        except Exception as e:
            logger.error(f"Error discovering competitors: {e}")
            return CompetitorDiscoveryResult(brand=brand, category=category, location=location)
    
    def _parse_competitor_response(
        self, 
        response: str, 
        brand: str, 
        category: str, 
        location: Optional[str]
    ) -> CompetitorDiscoveryResult:
        """Parse the AI response into CompetitorDiscoveryResult"""
        
        try:
            # Clean up response - remove markdown code blocks if present
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r'^```(?:json)?\n?', '', cleaned)
                cleaned = re.sub(r'\n?```$', '', cleaned)
            
            data = json.loads(cleaned)
            
            local_competitors = []
            for comp in data.get("local_competitors", []):
                if not comp.get("name"):
                    continue
                local_competitors.append(CompetitorSuggestion(
                    name=comp.get("name"),
                    website=comp.get("website") if comp.get("website") != "null" else None,
                    scope="local",
                    reason=comp.get("reason", "Local competitor"),
                    company_size=None
                ))
            
            global_competitors = []
            for comp in data.get("global_competitors", []):
                if not comp.get("name"):
                    continue
                global_competitors.append(CompetitorSuggestion(
                    name=comp.get("name"),
                    website=comp.get("website") if comp.get("website") != "null" else None,
                    scope="global",
                    reason=comp.get("reason", "Global competitor"),
                    company_size=None
                ))
            
            # Also handle flat array format (in case AI returns simpler format)
            if not local_competitors and not global_competitors and isinstance(data, list):
                for comp in data:
                    if not comp.get("name"):
                        continue
                    scope = comp.get("scope", "global").lower()
                    suggestion = CompetitorSuggestion(
                        name=comp.get("name"),
                        website=comp.get("website") if comp.get("website") != "null" else None,
                        scope=scope,
                        reason=comp.get("reason", "Competitor"),
                        company_size=None
                    )
                    if scope == "local":
                        local_competitors.append(suggestion)
                    else:
                        global_competitors.append(suggestion)
            
            return CompetitorDiscoveryResult(
                brand=brand,
                category=category,
                location=location,
                local_competitors=local_competitors,
                global_competitors=global_competitors,
                total_found=len(local_competitors) + len(global_competitors),
                size_breakdown={}
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse competitor JSON: {e}")
            logger.debug(f"Raw response: {response[:500]}")
            return CompetitorDiscoveryResult(brand=brand, category=category, location=location)
    
    async def _extract_business_context(self, url: str) -> str:
        """Extract business context from a website"""
        try:
            async with httpx.AsyncClient(
                timeout=15.0,
                follow_redirects=True,
                verify=False,  # Allow sites with SSL issues
                headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
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

