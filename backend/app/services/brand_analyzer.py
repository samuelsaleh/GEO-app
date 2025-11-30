"""
Brand Analyzer Service

Analyzes a brand's website to extract business context for smart prompt generation.
This is the core intelligence that powers the Peec AI-style visibility checker.

Flow:
1. Crawl website homepage
2. Extract: title, meta description, H1, content preview, schema
3. Use AI to infer: industry, products, value prop, competitors
4. Generate smart prompts based on extracted context
"""

import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
import json
import re
import logging
from datetime import datetime

from app.services.ai_service import ai_service
from app.models.brand_profile import (
    BrandProfile, 
    CompetitorInfo, 
    PromptWithCategory,
    TopicCluster
)

logger = logging.getLogger(__name__)


class BrandAnalyzer:
    """
    Analyze a website to extract business context for prompt generation.
    Similar to how Peec AI analyzes your site on signup.
    """
    
    def __init__(self):
        self.ai = ai_service
    
    async def analyze_brand(
        self, 
        website_url: str, 
        brand_name: str,
        industry_hint: Optional[str] = None,
        known_competitors: List[str] = []
    ) -> BrandProfile:
        """
        Main entry point: analyze a brand's website and return a complete profile.
        
        Args:
            website_url: The brand's website URL
            brand_name: The brand name
            industry_hint: Optional industry hint from user
            known_competitors: Competitors the user already knows
            
        Returns:
            BrandProfile with extracted info and generated prompts
        """
        logger.info(f"Analyzing brand: {brand_name} at {website_url}")
        
        # Step 1: Extract website content
        website_context = await self._extract_website_context(website_url)
        
        # Step 2: Use AI to analyze and extract business info
        business_info = await self._analyze_with_ai(
            brand_name=brand_name,
            website_context=website_context,
            industry_hint=industry_hint
        )
        
        # Step 3: Detect/suggest competitors
        competitors = await self._detect_competitors(
            brand_name=brand_name,
            website_url=website_url,
            business_info=business_info,
            known_competitors=known_competitors
        )
        
        # Step 4: Generate smart prompts
        prompts = await self._generate_smart_prompts(
            brand_name=brand_name,
            business_info=business_info,
            competitors=competitors
        )
        
        # Step 5: Organize prompts into topic clusters
        clusters = self._organize_into_clusters(prompts)
        
        # Build the profile with detailed segment info
        profile = BrandProfile(
            brand_name=brand_name,
            website_url=website_url,
            # Basic info
            industry=business_info.get("industry", "general"),
            products_services=business_info.get("products_services", []),
            value_proposition=business_info.get("value_proposition", ""),
            target_audience=business_info.get("target_audience", ""),
            # Specific segment info - shows we understand them!
            segment=business_info.get("segment", ""),
            positioning=business_info.get("positioning", ""),
            price_tier=business_info.get("price_tier", "mid-range"),
            brand_personality=business_info.get("brand_personality", []),
            differentiators=business_info.get("differentiators", []),
            brand_summary=business_info.get("brand_summary", ""),
            # Competitors and prompts
            competitors=competitors,
            suggested_prompts=prompts,
            topic_clusters=clusters,
            # Metadata
            analyzed_at=datetime.now(),
            confidence_score=business_info.get("confidence", 0.7)
        )
        
        logger.info(f"Analysis complete for {brand_name}: {len(prompts)} prompts generated")
        return profile
    
    async def _extract_website_context(self, url: str) -> Dict[str, Any]:
        """
        Crawl the website and extract relevant content.
        Reuses patterns from content_analyzer.py
        """
        context = {
            "url": url,
            "title": "",
            "meta_description": "",
            "h1": "",
            "h2s": [],
            "content_preview": "",
            "schema_types": [],
            "success": False
        }
        
        try:
            # Try with SSL verification first, fallback to no verification
            html = None
            for verify_ssl in [True, False]:
                try:
                    async with httpx.AsyncClient(
                        timeout=20.0,
                        follow_redirects=True,
                        verify=verify_ssl,
                        headers={
                            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                        }
                    ) as client:
                        response = await client.get(url)
                        response.raise_for_status()
                        html = response.text
                        break
                except Exception as e:
                    if verify_ssl:
                        logger.warning(f"SSL error for {url}, retrying: {e}")
                        continue
                    raise
            
            if not html:
                return context
            
            soup = BeautifulSoup(html, 'lxml')
            
            # Remove script and style elements
            for tag in soup(["script", "style", "noscript"]):
                tag.decompose()
            
            # Extract title
            title_tag = soup.find('title')
            context["title"] = title_tag.get_text().strip() if title_tag else ""
            
            # Extract meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            context["meta_description"] = meta_desc.get('content', '').strip() if meta_desc else ""
            
            # Extract H1
            h1 = soup.find('h1')
            context["h1"] = h1.get_text().strip() if h1 else ""
            
            # Extract H2s (for topic understanding)
            h2s = soup.find_all('h2')
            context["h2s"] = [h2.get_text().strip() for h2 in h2s[:5]]
            
            # Extract main content preview
            body_text = soup.get_text(separator=' ', strip=True)
            context["content_preview"] = body_text[:1500]  # First 1500 chars
            
            # Extract schema types
            schema_scripts = soup.find_all('script', type='application/ld+json')
            for script in schema_scripts:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and "@type" in data:
                        context["schema_types"].append(data["@type"])
                    elif isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and "@type" in item:
                                context["schema_types"].append(item["@type"])
                except:
                    pass
            
            context["success"] = True
            logger.info(f"Successfully extracted context from {url}")
            
        except Exception as e:
            logger.error(f"Error extracting website context: {e}")
            context["error"] = str(e)
        
        return context
    
    async def _analyze_with_ai(
        self,
        brand_name: str,
        website_context: Dict[str, Any],
        industry_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Use AI to analyze the website content and extract detailed business information.
        Focus on showing the customer we REALLY understand their business.
        Includes LOCAL BUSINESS detection (restaurants, hotels, stores, etc.)
        """
        if not self.ai.is_available:
            logger.warning("AI not available, using fallback analysis")
            return self._fallback_analysis(brand_name, website_context, industry_hint)
        
        prompt = f"""Analyze this website and extract DETAILED business information. 
Be VERY SPECIFIC - we want to show the brand that we deeply understand their business.

Website: {website_context.get('url', '')}
Brand Name: {brand_name}
{f"Industry Hint: {industry_hint}" if industry_hint else ""}

Website Content:
- Title: {website_context.get('title', 'N/A')}
- Description: {website_context.get('meta_description', 'N/A')}
- Main Heading: {website_context.get('h1', 'N/A')}
- Section Headings: {', '.join(website_context.get('h2s', []))}
- Content Preview: {website_context.get('content_preview', 'N/A')[:800]}
- Schema Types Found: {', '.join(website_context.get('schema_types', []))}

Extract and return JSON with:
{{
    "industry": "broad category (e.g., 'restaurant', 'fashion', 'technology', 'hotel', 'retail')",
    "business_type": "specific type (e.g., 'restaurant', 'hotel', 'retail store', 'e-commerce', 'SaaS', 'service provider')",
    "is_local_business": true/false,
    "location": {{
        "city": "city name if detectable (e.g., 'Antwerp', 'Paris', 'New York')",
        "region": "region/state if detectable",
        "country": "country if detectable"
    }},
    "segment": "SPECIFIC niche - be precise! (e.g., 'Mediterranean restaurant', 'French bistro', 'Italian fine dining', 'Japanese ramen shop')",
    "cuisine_or_style": "For restaurants: cuisine type (e.g., 'Mediterranean', 'Italian', 'Japanese', 'Belgian'). For fashion: style (e.g., 'minimalist', 'streetwear'). For hotels: type (e.g., 'boutique', 'business')",
    "positioning": "market position (e.g., 'Casual dining', 'Fine dining', 'Fast casual', 'Affordable luxury')",
    "price_tier": "budget | mid-range | premium | luxury",
    "brand_personality": ["3-5 personality traits"],
    "differentiators": ["2-3 things that make them unique"],
    "products_services": ["list of main offerings (dishes for restaurants, products for retail, services, etc.)"],
    "value_proposition": "one sentence describing their unique value",
    "target_audience": "specific description of ideal customer",
    "brand_summary": "One compelling sentence that shows we GET this brand",
    "keywords": ["5-7", "relevant", "keywords"],
    "confidence": 0.8
}}

IMPORTANT FOR LOCAL BUSINESSES (restaurants, hotels, stores):
- ALWAYS try to detect the city/location from the website content, address, or URL
- For restaurants: identify the CUISINE TYPE (Mediterranean, Italian, Asian, Belgian, etc.)
- For hotels: identify the TYPE (boutique, business, resort, etc.)
- The "segment" should include location + style (e.g., "Mediterranean restaurant in Antwerp")
- Think about what local competitors would be relevant (same cuisine, same city)

Return ONLY valid JSON, no markdown or explanation."""

        try:
            # Use Claude first for best analysis
            response = None
            available = self.ai.get_available_providers()
            
            if "anthropic" in available:
                logger.info("Using Claude Sonnet 4 for brand analysis")
                response = await self.ai.generate_with_model(
                    prompt=prompt,
                    system_prompt="You are a brand strategist expert who deeply understands brand positioning and market segments. Extract precise, insightful business information. Return only valid JSON.",
                    model="claude-sonnet-4-20250514",
                    provider="anthropic",
                    max_tokens=800,
                    temperature=0.3
                )
            
            if not response:
                response = await self.ai.generate(
                    prompt=prompt,
                    system_prompt="You are a brand strategist expert. Extract precise business information from websites. Return only valid JSON.",
                    max_tokens=800,
                    temperature=0.3
                )
            
            if response:
                # Clean and parse JSON
                cleaned = response.strip()
                if cleaned.startswith("```"):
                    cleaned = re.sub(r'^```(?:json)?\n?', '', cleaned)
                    cleaned = re.sub(r'\n?```$', '', cleaned)
                
                return json.loads(cleaned)
                
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
        
        return self._fallback_analysis(brand_name, website_context, industry_hint)
    
    def _fallback_analysis(
        self,
        brand_name: str,
        website_context: Dict[str, Any],
        industry_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """Fallback when AI is unavailable"""
        industry = industry_hint or "general"
        return {
            "industry": industry,
            "business_type": industry,
            "is_local_business": False,
            "location": {"city": "", "region": "", "country": ""},
            "segment": f"{brand_name} in {industry}",
            "cuisine_or_style": "",
            "positioning": "Quality brand",
            "price_tier": "mid-range",
            "brand_personality": ["quality", "reliable"],
            "differentiators": [f"{brand_name} unique approach"],
            "products_services": [f"{brand_name} products"],
            "value_proposition": website_context.get("meta_description", f"{brand_name} - Quality products and services"),
            "target_audience": "customers looking for quality",
            "brand_summary": f"{brand_name} offers quality {industry} products",
            "keywords": [brand_name.lower()],
            "confidence": 0.3
        }
    
    async def _detect_competitors(
        self,
        brand_name: str,
        website_url: str,
        business_info: Dict[str, Any],
        known_competitors: List[str] = []
    ) -> List[CompetitorInfo]:
        """
        Use AI to suggest competitors based on business context.
        
        - For LOCAL businesses: exactly 5 local competitors in the same city/region
        - For GLOBAL businesses: 5 direct competitors (no special local/international split)
        
        The UI only needs name and site, but we also keep a simple "type"
        tag (e.g. "local" or "direct") internally for labeling.
        """
        competitors = []
        
        # Add known competitors first
        for comp in known_competitors:
            competitors.append(CompetitorInfo(
                name=comp,
                reason="Added by user",
                auto_detected=False
            ))
        
        if not self.ai.is_available:
            return competitors
        
        # Check if this is a local business
        is_local = business_info.get('is_local_business', False)
        location = business_info.get('location', {})
        city = location.get('city', '') if isinstance(location, dict) else ''
        country = location.get('country', '') if isinstance(location, dict) else ''
        cuisine_or_style = business_info.get('cuisine_or_style', '')
        segment = business_info.get('segment', '')
        
        if is_local and city:
            # LOCAL BUSINESS: ask very simply for 5 local competitors based on the
            # place name and website the user provided.
            prompt = f"""You are a local expert for businesses in {city}, {country}.
Find 5 real local competitors for this place in the SAME city/area.

Place: {brand_name}
Website: {website_url}
City: {city}
Country: {country}
Category/segment: {segment or business_info.get('industry', 'unknown')}

Rules:
- Competitors must be real, existing places in or very near {city}
- Same type of place (restaurant/store/service) and similar style/category
- Do NOT include {brand_name} itself

Return ONLY a JSON array with exactly 5 items.
Each item must have:
- "name": competitor name
- "website_url": main website URL (full https URL)
- "type": "local"

Example:
[
  {{"name": "Local Competitor 1", "website_url": "https://example-local1.com", "type": "local"}},
  {{"name": "Local Competitor 2", "website_url": "https://example-local2.com", "type": "local"}},
  {{"name": "Local Competitor 3", "website_url": "https://example-local3.com", "type": "local"}},
  {{"name": "Local Competitor 4", "website_url": "https://example-local4.com", "type": "local"}},
  {{"name": "Local Competitor 5", "website_url": "https://example-local5.com", "type": "local"}}
]

Return ONLY the JSON array, no explanation or markdown."""
        else:
            # GLOBAL BUSINESS: Find 5 direct competitors
            prompt = f"""Identify 5 direct competitors for this business:

Brand: {brand_name}
Industry: {business_info.get('industry', 'unknown')}
Segment: {segment}
Products/Services: {', '.join(business_info.get('products_services', []))}
Target Audience: {business_info.get('target_audience', 'unknown')}

Return JSON array with competitors:
[
    {{"name": "Competitor Name", "website_url": "https://example.com", "reason": "Brief reason why they compete", "type": "direct"}},
    ...
]

Focus on REAL companies that directly compete in the same market.
Return ONLY valid JSON array, no markdown."""

        try:
            # Prefer GPT-5.1 for competitor discovery (great at recommendations),
            # then fall back to Claude / default provider if needed.
            response = None
            available = self.ai.get_available_providers()
            
            # 1) Try OpenAI GPT-5.1 first
            if "openai" in available:
                try:
                    response = await self.ai.generate_with_model(
                        prompt=prompt,
                        system_prompt="You are a local market expert with deep knowledge of restaurants and local businesses. Identify real competitor places. Return only valid JSON.",
                        model="gpt-5.1",
                        provider="openai",
                        max_tokens=600,
                        temperature=0.3,
                        web_search=True
                    )
                except Exception as e:
                    logger.warning(f"GPT-5.1 competitor discovery failed: {e}")
                    response = None
            
            # 2) Fallback to Claude Sonnet 4
            if not response and "anthropic" in available:
                try:
                    response = await self.ai.generate_with_model(
                        prompt=prompt,
                        system_prompt="You are a local market expert with deep knowledge of businesses worldwide. For local businesses, you know real restaurants, hotels, and stores in specific cities. Identify real competitor companies. Return only valid JSON.",
                        model="claude-sonnet-4-20250514",
                        provider="anthropic",
                        max_tokens=600,
                        temperature=0.3,
                        web_search=True
                    )
                except Exception as e:
                    logger.warning(f"Claude competitor discovery failed: {e}")
                    response = None
            
            # 3) Final fallback to default provider chain
            if not response:
                response = await self.ai.generate(
                    prompt=prompt,
                    system_prompt="You are a competitive analysis expert. Identify real competitor companies. Return only valid JSON.",
                    max_tokens=600,
                    temperature=0.3,
                    web_search=True
                )
            
            if response:
                cleaned = response.strip()
                if cleaned.startswith("```"):
                    cleaned = re.sub(r'^```(?:json)?\n?', '', cleaned)
                    cleaned = re.sub(r'\n?```$', '', cleaned)
                
                ai_competitors = json.loads(cleaned)
                
                # Support both flat array and grouped structures if the model returns them
                if isinstance(ai_competitors, dict):
                    flat_list = []
                    for value in ai_competitors.values():
                        if isinstance(value, list):
                            flat_list.extend(value)
                    ai_competitors = flat_list
                
                for comp in ai_competitors:
                    name = comp.get("name")
                    if not name or name in known_competitors:
                        continue
                    
                    comp_type = comp.get("type", "direct")
                    base_reason = comp.get("reason", "AI detected competitor")
                    if comp_type == "local":
                        reason = f"🏠 Local: {base_reason}"
                    elif comp_type == "international":
                        reason = f"🌍 International: {base_reason}"
                    else:
                        reason = base_reason
                    
                    website_url = comp.get("website_url") or comp.get("website") or None
                    
                    competitors.append(CompetitorInfo(
                        name=name,
                        reason=reason,
                        website_url=website_url,
                        auto_detected=True
                    ))
                        
        except Exception as e:
            logger.error(f"Competitor detection failed: {e}")
        
        return competitors[:5]  # Limit to 5
    
    async def _generate_smart_prompts(
        self,
        brand_name: str,
        business_info: Dict[str, Any],
        competitors: List[CompetitorInfo]
    ) -> List[PromptWithCategory]:
        """
        Generate Peec-style conversational prompts based on business context.
        
        Categories:
        - recommendation: "What's the best X for Y?"
        - comparison: "Brand A vs Brand B"
        - purchase: "Where to buy X?"
        - reputation: "Is X good? Reviews"
        - feature: "Best X with feature Y"
        """
        prompts = []
        industry = business_info.get("industry", "products")
        products = business_info.get("products_services", [])
        audience = business_info.get("target_audience", "customers")
        comp_names = [c.name for c in competitors[:3]]
        
        # If AI is available, generate smart prompts
        if self.ai.is_available:
            ai_prompts = await self._generate_prompts_with_ai(
                brand_name=brand_name,
                industry=industry,
                products=products,
                audience=audience,
                competitors=comp_names
            )
            if ai_prompts:
                return ai_prompts
        
        # Fallback: Template-based generation
        return self._generate_template_prompts(
            brand_name=brand_name,
            industry=industry,
            products=products,
            competitors=comp_names
        )
    
    async def _generate_prompts_with_ai(
        self,
        brand_name: str,
        industry: str,
        products: List[str],
        audience: str,
        competitors: List[str]
    ) -> List[PromptWithCategory]:
        """Use AI to generate natural, conversational prompts"""
        
        prompt = f"""Generate 10 search prompts that potential customers might ask AI assistants about this type of business.

Brand: {brand_name}
Industry: {industry}
Products/Services: {', '.join(products)}
Target Audience: {audience}
Competitors: {', '.join(competitors) if competitors else 'unknown'}

Generate prompts in these categories (2 each):
1. recommendation - Questions asking for best options (e.g., "What's the best X for Y?")
2. comparison - Brand vs brand questions (e.g., "How does X compare to Y?")
3. purchase - Where/how to buy questions (e.g., "Where can I buy X?")
4. reputation - Brand quality/review questions (e.g., "Is X a good brand?")
5. feature - Specific feature questions (e.g., "Best X with feature Y")

IMPORTANT: Make prompts conversational and specific, NOT generic keywords.
- BAD: "Best CRM software"
- GOOD: "What CRM would work best for a sales team of 10 people?"

Return JSON array:
[
    {{"prompt": "conversational question here", "category": "recommendation"}},
    ...
]

Return ONLY valid JSON array."""

        try:
            response = await self.ai.generate(
                prompt=prompt,
                system_prompt="You are a marketing expert who understands how people ask AI assistants for recommendations. Generate realistic, conversational search prompts.",
                max_tokens=800,
                temperature=0.6
            )
            
            if response:
                cleaned = response.strip()
                if cleaned.startswith("```"):
                    cleaned = re.sub(r'^```(?:json)?\n?', '', cleaned)
                    cleaned = re.sub(r'\n?```$', '', cleaned)
                
                ai_prompts = json.loads(cleaned)
                
                return [
                    PromptWithCategory(
                        prompt=p["prompt"],
                        category=p.get("category", "recommendation"),
                        selected=True
                    )
                    for p in ai_prompts
                ]
                
        except Exception as e:
            logger.error(f"AI prompt generation failed: {e}")
        
        return []
    
    def _generate_template_prompts(
        self,
        brand_name: str,
        industry: str,
        products: List[str],
        competitors: List[str]
    ) -> List[PromptWithCategory]:
        """Fallback template-based prompt generation"""
        prompts = []
        product = products[0] if products else industry
        comp = competitors[0] if competitors else "alternatives"
        
        # Recommendation prompts
        prompts.extend([
            PromptWithCategory(
                prompt=f"What are the best {industry} brands?",
                category="recommendation"
            ),
            PromptWithCategory(
                prompt=f"What's the best option for {product}?",
                category="recommendation"
            ),
        ])
        
        # Comparison prompts
        if competitors:
            prompts.extend([
                PromptWithCategory(
                    prompt=f"How does {brand_name} compare to {comp}?",
                    category="comparison"
                ),
                PromptWithCategory(
                    prompt=f"{brand_name} vs {comp} - which is better?",
                    category="comparison"
                ),
            ])
        
        # Purchase prompts
        prompts.extend([
            PromptWithCategory(
                prompt=f"Where can I buy {product}?",
                category="purchase"
            ),
            PromptWithCategory(
                prompt=f"Best places to buy {industry} products online",
                category="purchase"
            ),
        ])
        
        # Reputation prompts
        prompts.extend([
            PromptWithCategory(
                prompt=f"Is {brand_name} a good brand?",
                category="reputation"
            ),
            PromptWithCategory(
                prompt=f"{brand_name} reviews - is it worth it?",
                category="reputation"
            ),
        ])
        
        # Feature prompts
        prompts.extend([
            PromptWithCategory(
                prompt=f"Best {industry} with good customer service",
                category="feature"
            ),
            PromptWithCategory(
                prompt=f"Top rated {industry} with fast shipping",
                category="feature"
            ),
        ])
        
        return prompts
    
    def _organize_into_clusters(
        self,
        prompts: List[PromptWithCategory]
    ) -> List[TopicCluster]:
        """Organize prompts into topic clusters by category"""
        
        category_names = {
            "recommendation": "Product Recommendations",
            "comparison": "Brand Comparisons",
            "purchase": "Purchase & Availability",
            "reputation": "Reviews & Reputation",
            "feature": "Features & Specifications"
        }
        
        # Group prompts by category
        by_category: Dict[str, List[PromptWithCategory]] = {}
        for prompt in prompts:
            cat = prompt.category
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(prompt)
        
        # Create clusters
        clusters = []
        for cat, cat_prompts in by_category.items():
            clusters.append(TopicCluster(
                name=category_names.get(cat, cat.title()),
                category=cat,
                prompts=cat_prompts
            ))
        
        return clusters


# Singleton instance
brand_analyzer = BrandAnalyzer()

