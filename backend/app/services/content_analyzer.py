"""Content analyzer service for AI visibility analysis"""
import httpx
from bs4 import BeautifulSoup
from app.models.health_check import PageAnalysis
from app.config import settings
from app.services.geo_scoring import geo_scorer, GEOScore
from typing import List, Dict, Any, Optional
import re
import json
import logging

logger = logging.getLogger(__name__)


class ContentAnalyzer:
    """Analyze web pages for AI visibility factors"""
    
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self._init_ai_clients()
    
    def _init_ai_clients(self):
        """Initialize AI API clients if keys are available"""
        if settings.openai_api_key:
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=settings.openai_api_key)
                logger.info("OpenAI client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
        
        if settings.anthropic_api_key:
            try:
                from anthropic import Anthropic
                self.anthropic_client = Anthropic(api_key=settings.anthropic_api_key)
                logger.info("Anthropic client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Anthropic client: {e}")

    async def analyze_page(self, url: str) -> PageAnalysis:
        """Analyze a single page for AI visibility"""
        logger.info(f"Analyzing page: {url}")
        
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; DwightBot/1.0; +https://dwight.app)"
            }
        ) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                html = response.text
            except httpx.TimeoutException:
                raise Exception(f"Timeout fetching page (>15s)")
            except httpx.HTTPStatusError as e:
                raise Exception(f"HTTP error {e.response.status_code}")
            except Exception as e:
                raise Exception(f"Failed to fetch page: {str(e)}")

        soup = BeautifulSoup(html, 'lxml')
        
        # Remove script and style elements
        for script in soup(["script", "style", "noscript"]):
            script.decompose()

        # Extract analysis components
        schema_analysis = self._analyze_schema(soup)
        content_analysis = self._analyze_content(soup)
        seo_analysis = self._analyze_seo(soup, url)
        structure_analysis = self._analyze_structure(soup)
        
        # Aggregate issues and strengths
        issues = []
        strengths = []
        
        # Schema issues
        if not schema_analysis["has_schema"]:
            issues.append("No structured data (schema.org) detected")
        else:
            strengths.append(f"Schema markup present ({', '.join(schema_analysis['types'])})")
        
        # FAQ
        if not content_analysis["has_faq"]:
            issues.append("No FAQ section found - important for AI snippets")
        else:
            strengths.append("FAQ section detected - great for AI citations")
        
        # Meta description
        if not seo_analysis["has_meta_desc"]:
            issues.append("Missing meta description")
        elif len(seo_analysis.get("meta_desc_length", 0)) < 50:
            issues.append("Meta description too short")
        else:
            strengths.append("Meta description present and optimized")
        
        # Headings
        if structure_analysis["h1_count"] == 0:
            issues.append("Missing H1 tag")
        elif structure_analysis["h1_count"] > 1:
            issues.append(f"Multiple H1 tags ({structure_analysis['h1_count']}) - should have exactly 1")
        else:
            strengths.append("Proper H1 heading structure")
        
        # Content quality
        if content_analysis["readability_score"] < 50:
            issues.append("Content may be difficult to read - consider simplifying")
        elif content_analysis["readability_score"] > 70:
            strengths.append("Content is clear and readable")
        
        if content_analysis["word_count"] < 300:
            issues.append("Content may be too thin for AI to extract value")
        elif content_analysis["word_count"] > 500:
            strengths.append(f"Good content depth ({content_analysis['word_count']} words)")
        
        # Internal links
        if structure_analysis["internal_links"] < 3:
            issues.append("Add more internal links to help AI understand site structure")
        else:
            strengths.append("Good internal linking")
        
        # Calculate overall score
        score = self._calculate_score(
            schema_analysis,
            content_analysis,
            seo_analysis,
            structure_analysis
        )

        return PageAnalysis(
            url=url,
            score=score,
            has_schema=schema_analysis["has_schema"],
            has_faq=content_analysis["has_faq"],
            readability_score=content_analysis["readability_score"],
            page_speed=0,  # Would need external API
            issues=issues[:10],  # Limit to top 10
            strengths=strengths[:5]  # Limit to top 5
        )
    
    def _analyze_schema(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Analyze schema.org structured data"""
        schema_scripts = soup.find_all('script', type='application/ld+json')
        schema_types = []
        
        for script in schema_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    for item in data:
                        if "@type" in item:
                            schema_types.append(item["@type"])
                elif "@type" in data:
                    schema_types.append(data["@type"])
            except:
                pass
        
        return {
            "has_schema": len(schema_scripts) > 0,
            "count": len(schema_scripts),
            "types": list(set(schema_types))
        }
    
    def _analyze_content(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Analyze content quality"""
        text_content = soup.get_text(separator=' ', strip=True)
        words = text_content.split()
        word_count = len(words)
        
        # Sentence analysis
        sentences = re.split(r'[.!?]+', text_content)
        sentences = [s.strip() for s in sentences if s.strip()]
        sentence_count = len(sentences)
        
        if sentence_count > 0:
            avg_words_per_sentence = word_count / sentence_count
            # Flesch-like readability (simplified)
            readability_score = max(0, min(100, 100 - (avg_words_per_sentence - 15) * 2))
        else:
            avg_words_per_sentence = 0
            readability_score = 0
        
        # Check for FAQ sections
        has_faq = bool(
            soup.find(['div', 'section', 'article'], class_=re.compile(r'faq', re.I)) or
            soup.find(['h2', 'h3', 'h4'], string=re.compile(r'faq|frequently asked|common questions', re.I)) or
            soup.find('script', type='application/ld+json', string=re.compile(r'FAQPage', re.I))
        )
        
        return {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "avg_words_per_sentence": avg_words_per_sentence,
            "readability_score": readability_score,
            "has_faq": has_faq
        }
    
    def _analyze_seo(self, soup: BeautifulSoup, url: str) -> Dict[str, Any]:
        """Analyze SEO elements"""
        # Meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        meta_desc_content = meta_desc.get('content', '') if meta_desc else ''
        
        # Title
        title_tag = soup.find('title')
        title = title_tag.get_text() if title_tag else ''
        
        # Canonical
        canonical = soup.find('link', rel='canonical')
        canonical_url = canonical.get('href', '') if canonical else ''
        
        # Open Graph
        og_title = soup.find('meta', property='og:title')
        og_desc = soup.find('meta', property='og:description')
        og_image = soup.find('meta', property='og:image')
        
        return {
            "has_meta_desc": bool(meta_desc_content),
            "meta_desc_length": len(meta_desc_content),
            "title": title,
            "title_length": len(title),
            "has_canonical": bool(canonical_url),
            "has_og_tags": bool(og_title and og_desc),
            "has_og_image": bool(og_image)
        }
    
    def _analyze_structure(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Analyze page structure"""
        # Headings
        h1_tags = soup.find_all('h1')
        h2_tags = soup.find_all('h2')
        h3_tags = soup.find_all('h3')
        
        # Links
        all_links = soup.find_all('a', href=True)
        internal_links = [a for a in all_links if not a['href'].startswith(('http', '//'))]
        external_links = [a for a in all_links if a['href'].startswith(('http', '//'))]
        
        # Images
        images = soup.find_all('img')
        images_with_alt = [img for img in images if img.get('alt')]
        
        return {
            "h1_count": len(h1_tags),
            "h2_count": len(h2_tags),
            "h3_count": len(h3_tags),
            "internal_links": len(internal_links),
            "external_links": len(external_links),
            "total_images": len(images),
            "images_with_alt": len(images_with_alt)
        }
    
    def _calculate_score(
        self,
        schema: Dict[str, Any],
        content: Dict[str, Any],
        seo: Dict[str, Any],
        structure: Dict[str, Any]
    ) -> int:
        """
        Calculate overall AI visibility score using the GEO Scoring System
        
        The GEO (Generative Engine Optimization) score evaluates:
        - STRUCTURE (25%): Content organization, headings, links
        - SCHEMA (20%): Structured data quality
        - AUTHORITY (15%): E-E-A-T signals
        - CITABILITY (20%): How quotable is the content
        - FRESHNESS (10%): Up-to-date signals
        - ACCESSIBILITY (10%): Technical SEO
        
        Returns: Score from 0-100
        """
        try:
            # Use the advanced GEO scoring system
            geo_result: GEOScore = geo_scorer.calculate_score(
                schema_data=schema,
                content_data=content,
                seo_data=seo,
                structure_data=structure
            )
            
            logger.info(f"GEO Score: {geo_result.total_score} (Grade: {geo_result.grade})")
            
            return geo_result.total_score
            
        except Exception as e:
            logger.error(f"GEO scoring failed, using fallback: {e}")
            # Fallback to simple scoring if GEO scorer fails
            return self._calculate_score_fallback(schema, content, seo, structure)
    
    def _calculate_score_fallback(
        self,
        schema: Dict[str, Any],
        content: Dict[str, Any],
        seo: Dict[str, Any],
        structure: Dict[str, Any]
    ) -> int:
        """Fallback scoring if GEO scorer fails"""
        score = 30  # Base score
        
        # Schema (max +25)
        if schema.get("has_schema"):
            score += 15
            if len(schema.get("types", [])) > 1:
                score += 10
        
        # Content quality (max +25)
        if content.get("has_faq"):
            score += 10
        if content.get("word_count", 0) >= 500:
            score += 8
        elif content.get("word_count", 0) >= 300:
            score += 4
        if content.get("readability_score", 0) >= 60:
            score += 7
        
        # SEO (max +15)
        if seo.get("has_meta_desc"):
            score += 5
        if seo.get("has_og_tags"):
            score += 5
        if seo.get("has_canonical"):
            score += 5
        
        # Structure (max +5)
        if structure.get("h1_count") == 1:
            score += 3
        if structure.get("h2_count", 0) >= 2:
            score += 2
        
        return min(100, score)

    def generate_recommendations(self, pages: List[PageAnalysis]) -> List[str]:
        """Generate prioritized recommendations based on analysis"""
        if not pages:
            return ["No pages were analyzed successfully"]
        
        recommendations = []
        
        # Count issues
        no_schema_count = sum(1 for p in pages if not p.has_schema)
        no_faq_count = sum(1 for p in pages if not p.has_faq)
        low_readability = sum(1 for p in pages if p.readability_score < 60)
        
        # Priority 1: Schema markup
        if no_schema_count > 0:
            pct = (no_schema_count / len(pages)) * 100
            recommendations.append(
                f"🎯 Add schema markup to {no_schema_count} pages ({pct:.0f}%) - "
                f"Use our Schema Generator to create JSON-LD for product, FAQ, and article content"
            )
        
        # Priority 2: FAQ sections
        if no_faq_count > len(pages) * 0.5:
            recommendations.append(
                "📝 Add FAQ sections to your key pages - AI engines love citing Q&A content"
            )
        
        # Priority 3: Readability
        if low_readability > len(pages) * 0.3:
            recommendations.append(
                "✍️ Improve content readability - use shorter sentences, bullet points, and clear headings"
            )
        
        # Always include these best practices
        recommendations.extend([
            "🔗 Ensure all pages have unique, descriptive meta descriptions (150-160 characters)",
            "📊 Use clear H1→H2→H3 heading hierarchy to help AI understand content structure",
            "🌐 Add internal links between related pages to help AI map your content",
            "⚡ Consider page speed optimization - faster sites get crawled more frequently"
        ])
        
        return recommendations[:6]  # Return top 6 recommendations
    
    async def get_ai_insights(self, content: str) -> Optional[str]:
        """Get AI-powered insights on content (if API keys configured)"""
        if not self.openai_client and not self.anthropic_client:
            return None
        
        prompt = f"""Analyze this webpage content for AI search visibility. 
        Provide 3 specific, actionable recommendations to improve how AI systems 
        like ChatGPT, Perplexity, and Claude would understand and cite this content.
        Be concise and practical.
        
        Content:
        {content[:4000]}
        """
        
        try:
            if self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=500
                )
                return response.choices[0].message.content
        except Exception as e:
            logger.error(f"AI insight generation failed: {e}")
        
        return None
