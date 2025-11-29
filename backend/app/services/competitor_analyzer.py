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

    async def discover_top_competitors(
        self,
        brand: str,
        category: str,
        location: Optional[str] = None
    ) -> CompetitorDiscoveryResult:
        """
        Discover top 20 competitors: 10 local/national + 10 global scale.
        Includes company size classification.
        
        Priority order:
        1. Claude Sonnet 4 (best for analysis)
        2. Gemini 1.5 Pro (fallback)
        3. Any available provider
        
        Args:
            brand: The brand name to find competitors for
            category: Product/service category (e.g., "fashion clothing", "running shoes")
            location: Optional location for local competitors (e.g., "France", "New York")
            
        Returns:
            CompetitorDiscoveryResult with local and global competitors including size
        """
        if not self.ai.is_available:
            logger.warning("No AI providers available for competitor discovery")
            return CompetitorDiscoveryResult(brand=brand, category=category, location=location)
        
        # Build the prompt for competitor discovery
        location_context = f" in {location}" if location else ""
        
        prompt = f"""You are a market research expert. Find the TOP 20 COMPETITORS for this brand:

Brand: {brand}
Category: {category}
Location: {location if location else "Global"}

I need you to identify:

**10 LOCAL/NATIONAL COMPETITORS:**
These are competitors that operate primarily{location_context or " in the same market/region as the brand"}. 
Include a mix of sizes from small local players to national chains.

**10 GLOBAL COMPETITORS:**
These are international brands that compete in the same {category} space worldwide.
Include a mix from medium-sized international brands to major global players.

**COMPANY SIZE CLASSIFICATION:**
For each competitor, estimate their size category:
- "micro": <10 employees, <€2M revenue
- "small": <50 employees, <€10M revenue  
- "medium": <250 employees, <€50M revenue
- "large": 250+ employees or €50M+ revenue

Return your response as valid JSON in this EXACT format:
{{
    "local_competitors": [
        {{
            "name": "Competitor Name",
            "website": "https://example.com",
            "reason": "Brief reason why they compete",
            "size": "small",
            "estimated_employees": "20-50",
            "estimated_revenue": "€5M-€10M"
        }},
        ... (10 total)
    ],
    "global_competitors": [
        {{
            "name": "Competitor Name",
            "website": "https://example.com",
            "reason": "Brief reason why they compete",
            "size": "large",
            "estimated_employees": "1000+",
            "estimated_revenue": "€500M+"
        }},
        ... (10 total)
    ]
}}

IMPORTANT:
- Return ONLY valid JSON, no markdown code blocks
- Include exactly 10 local and 10 global competitors (20 total)
- Use real company names and actual website URLs
- Do NOT include {brand} itself in the list
- Make sure competitors are relevant to {category}
- Include a mix of sizes: some micro/small, some medium, some large
- Be realistic about company sizes based on your knowledge"""

        system_prompt = """You are a market research expert specializing in competitive analysis. 
You have extensive knowledge of brands and company sizes across all industries worldwide.
Always return valid JSON only, no explanations or markdown."""

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
            
            # 2. Fallback to Gemini 1.5 Pro
            if not response and "google" in available_providers:
                logger.info("💎 Trying Gemini 1.5 Pro for competitor discovery...")
                try:
                    response = await self.ai.generate_with_model(
                        prompt=prompt,
                        system_prompt=system_prompt,
                        model="gemini-1.5-pro-latest",
                        provider="google",
                        max_tokens=3000,
                        temperature=0.3
                    )
                    if response:
                        logger.info("✅ Gemini 1.5 Pro responded successfully")
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
        """Parse the AI response into CompetitorDiscoveryResult with company sizes"""
        
        # Size category descriptions
        size_descriptions = {
            "micro": "<10 employees, <€2M revenue",
            "small": "<50 employees, <€10M revenue",
            "medium": "<250 employees, <€50M revenue",
            "large": "250+ employees or €50M+ revenue"
        }
        
        try:
            # Clean up response - remove markdown code blocks if present
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r'^```(?:json)?\n?', '', cleaned)
                cleaned = re.sub(r'\n?```$', '', cleaned)
            
            data = json.loads(cleaned)
            
            # Track size breakdown
            size_counts = {"micro": 0, "small": 0, "medium": 0, "large": 0}
            
            local_competitors = []
            for comp in data.get("local_competitors", [])[:10]:
                size_cat = comp.get("size", "medium").lower()
                if size_cat not in size_descriptions:
                    size_cat = "medium"
                size_counts[size_cat] += 1
                
                company_size = CompanySize(
                    category=size_cat,
                    description=size_descriptions[size_cat],
                    estimated_employees=comp.get("estimated_employees"),
                    estimated_revenue=comp.get("estimated_revenue")
                )
                
                local_competitors.append(CompetitorSuggestion(
                    name=comp.get("name", "Unknown"),
                    website=comp.get("website"),
                    scope="local",
                    reason=comp.get("reason", "Identified as local competitor"),
                    company_size=company_size
                ))
            
            global_competitors = []
            for comp in data.get("global_competitors", [])[:10]:
                size_cat = comp.get("size", "large").lower()
                if size_cat not in size_descriptions:
                    size_cat = "large"
                size_counts[size_cat] += 1
                
                company_size = CompanySize(
                    category=size_cat,
                    description=size_descriptions[size_cat],
                    estimated_employees=comp.get("estimated_employees"),
                    estimated_revenue=comp.get("estimated_revenue")
                )
                
                global_competitors.append(CompetitorSuggestion(
                    name=comp.get("name", "Unknown"),
                    website=comp.get("website"),
                    scope="global",
                    reason=comp.get("reason", "Identified as global competitor"),
                    company_size=company_size
                ))
            
            return CompetitorDiscoveryResult(
                brand=brand,
                category=category,
                location=location,
                local_competitors=local_competitors,
                global_competitors=global_competitors,
                total_found=len(local_competitors) + len(global_competitors),
                size_breakdown=size_counts
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

