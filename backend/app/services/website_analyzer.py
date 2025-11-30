"""
Website Analyzer Service

Fetches website content and uses AI to extract brand context
for generating smart, relevant prompts.
"""

import logging
import re
import asyncio
import httpx
from typing import Optional, List, Dict, Any
from bs4 import BeautifulSoup

from app.models.speed_test import BrandContext, AnalyzeSiteResponse

logger = logging.getLogger(__name__)

# Try to import AI service
try:
    from app.services.ai_service import ai_service
except ImportError:
    ai_service = None
    logger.warning("AI service not available for website analysis")


class WebsiteAnalyzer:
    """
    Analyzes websites to extract brand context for smart prompt generation.
    """
    
    # Timeout for website fetching
    FETCH_TIMEOUT = 15.0
    
    # Max content length to send to AI
    MAX_CONTENT_LENGTH = 8000
    
    async def analyze_website(
        self,
        brand_name: str,
        website_url: str,
        additional_context: Optional[str] = None
    ) -> AnalyzeSiteResponse:
        """
        Main entry point - analyze a website and extract brand context.
        
        Args:
            brand_name: The brand name
            website_url: URL to analyze
            additional_context: Optional extra info from user
        
        Returns:
            AnalyzeSiteResponse with brand context and suggested questions
        """
        try:
            # 1. Fetch website content
            logger.info(f"Fetching website: {website_url}")
            content = await self._fetch_website_content(website_url)
            
            if not content:
                return AnalyzeSiteResponse(
                    success=False,
                    error="Could not fetch website content. Please check the URL."
                )
            
            # 2. Extract brand context using AI
            logger.info(f"Analyzing content for {brand_name}...")
            brand_context = await self._extract_brand_context(
                brand_name=brand_name,
                website_url=website_url,
                content=content,
                additional_context=additional_context
            )
            
            if not brand_context:
                # Fallback: create basic context from available info
                brand_context = self._create_fallback_context(
                    brand_name=brand_name,
                    website_url=website_url,
                    content=content,
                    additional_context=additional_context
                )
            
            # 3. Generate suggested questions
            questions = self._generate_suggested_questions(brand_context)
            brand_context.suggested_questions = questions
            
            return AnalyzeSiteResponse(
                success=True,
                brand_context=brand_context,
                suggested_questions=questions,
                detected_category=brand_context.product_category,
                detected_competitors=brand_context.known_competitors
            )
            
        except Exception as e:
            logger.error(f"Website analysis failed: {e}")
            return AnalyzeSiteResponse(
                success=False,
                error=str(e)
            )
    
    async def _fetch_website_content(self, url: str) -> Optional[str]:
        """Fetch and parse website content"""
        try:
            # Normalize URL
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            async with httpx.AsyncClient(
                timeout=self.FETCH_TIMEOUT,
                follow_redirects=True
            ) as client:
                response = await client.get(
                    url,
                    headers={
                        'User-Agent': 'Mozilla/5.0 (compatible; DwightBot/1.0; +https://dwight.ai)'
                    }
                )
                response.raise_for_status()
                html = response.text
            
            # Parse HTML
            soup = BeautifulSoup(html, 'html.parser')
            
            # Remove script and style elements
            for element in soup(['script', 'style', 'nav', 'footer', 'header']):
                element.decompose()
            
            # Extract useful content
            content_parts = []
            
            # Get title
            title = soup.find('title')
            if title:
                content_parts.append(f"Title: {title.get_text().strip()}")
            
            # Get meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc and meta_desc.get('content'):
                content_parts.append(f"Description: {meta_desc['content']}")
            
            # Get h1, h2, h3 headings
            for tag in ['h1', 'h2', 'h3']:
                headings = soup.find_all(tag)[:5]  # Limit to first 5
                for h in headings:
                    text = h.get_text().strip()
                    if text and len(text) > 3:
                        content_parts.append(f"{tag.upper()}: {text}")
            
            # Get main content paragraphs
            paragraphs = soup.find_all('p')
            for p in paragraphs[:20]:  # Limit to first 20 paragraphs
                text = p.get_text().strip()
                if len(text) > 50:  # Only substantial paragraphs
                    content_parts.append(text)
            
            # Get any product/service mentions
            for element in soup.find_all(['article', 'section', 'div'], class_=re.compile(r'product|service|about|hero', re.I)):
                text = element.get_text().strip()
                if len(text) > 100 and len(text) < 2000:
                    content_parts.append(text)
            
            # Combine and truncate
            content = '\n\n'.join(content_parts)
            return content[:self.MAX_CONTENT_LENGTH]
            
        except Exception as e:
            logger.error(f"Failed to fetch {url}: {e}")
            return None
    
    async def _extract_brand_context(
        self,
        brand_name: str,
        website_url: str,
        content: str,
        additional_context: Optional[str] = None
    ) -> Optional[BrandContext]:
        """Use AI to extract structured brand context from website content"""
        
        if not ai_service:
            return None
        
        prompt = f"""Analyze this website content for "{brand_name}" and extract key information.

Website URL: {website_url}
{f"Additional context from user: {additional_context}" if additional_context else ""}

Website Content:
{content[:6000]}

---

Please analyze and respond with EXACTLY this JSON format (no other text):
{{
    "product_category": "what they sell in 2-5 words, be specific (e.g., 'luxury French jewelry' not just 'jewelry')",
    "product_types": ["specific product type 1", "product type 2", "product type 3"],
    "brand_description": "one sentence describing what makes this brand special",
    "unique_selling_points": ["usp 1", "usp 2", "usp 3"],
    "target_audience": "who is their target customer",
    "price_range": "budget/mid-range/premium/luxury",
    "known_competitors": ["competitor 1", "competitor 2", "competitor 3", "competitor 4", "competitor 5"],
    "location": "where they are based or operate (if mentioned)"
}}

Be specific! For example:
- Bad: "jewelry" → Good: "luxury French jewelry" or "handmade artisan jewelry"
- Bad: "software" → Good: "CRM software for small businesses" or "AI writing assistant"

Focus on what makes this specific brand unique, not generic category info."""

        try:
            response = await ai_service.generate_with_model(
                prompt=prompt,
                system_prompt="You are a brand analyst. Extract structured information from website content. Always respond with valid JSON only.",
                model="gpt-5.1-mini",
                provider="openai",
                max_tokens=800,
                temperature=0.2
            )
            
            if not response:
                return None
            
            # Parse JSON from response
            import json
            
            # Clean response - strip markdown code blocks if present
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r'^```(?:json)?\n?', '', cleaned)
                cleaned = re.sub(r'\n?```$', '', cleaned)
            
            # Parse the cleaned JSON
            data = json.loads(cleaned)
            
            return BrandContext(
                brand_name=brand_name,
                website_url=website_url,
                product_category=data.get('product_category', 'products/services'),
                product_types=data.get('product_types', []),
                brand_description=data.get('brand_description', ''),
                unique_selling_points=data.get('unique_selling_points', []),
                target_audience=data.get('target_audience', ''),
                price_range=data.get('price_range', ''),
                known_competitors=data.get('known_competitors', []),
                location=data.get('location'),
            )
            
        except Exception as e:
            logger.error(f"AI extraction failed: {e}")
            return None
    
    def _create_fallback_context(
        self,
        brand_name: str,
        website_url: str,
        content: str,
        additional_context: Optional[str] = None
    ) -> BrandContext:
        """Create basic brand context when AI analysis fails"""
        
        # Try to extract category from content
        category = "products and services"
        if additional_context:
            category = additional_context
        else:
            # Simple keyword detection
            content_lower = content.lower()
            if any(w in content_lower for w in ['jewelry', 'jewellery', 'rings', 'necklace']):
                category = "jewelry"
            elif any(w in content_lower for w in ['software', 'saas', 'platform', 'app']):
                category = "software"
            elif any(w in content_lower for w in ['restaurant', 'food', 'menu', 'dining']):
                category = "restaurant"
            elif any(w in content_lower for w in ['shoes', 'footwear', 'sneakers']):
                category = "footwear"
            elif any(w in content_lower for w in ['clothing', 'fashion', 'apparel']):
                category = "fashion"
        
        return BrandContext(
            brand_name=brand_name,
            website_url=website_url,
            product_category=category,
        )
    
    def _generate_suggested_questions(self, brand_context: BrandContext) -> List[str]:
        """Generate suggested questions based on brand context"""
        
        questions = []
        category = brand_context.product_category
        brand = brand_context.brand_name
        
        # Recommendation questions
        questions.append(f"What are the best {category}?")
        questions.append(f"Top {category} brands in 2025")
        
        # Reputation question
        questions.append(f"Is {brand} good? What are alternatives?")
        
        # Purchase question
        questions.append(f"Where should I buy {category}?")
        
        # Comparison question (if we have competitors)
        if brand_context.known_competitors:
            competitor = brand_context.known_competitors[0]
            questions.append(f"{brand} vs {competitor} - which is better?")
        else:
            questions.append(f"Compare the top {category} brands")
        
        return questions[:5]  # Return max 5 questions


# Singleton instance
website_analyzer = WebsiteAnalyzer()

