import httpx
from bs4 import BeautifulSoup
from app.models.health_check import PageAnalysis
from typing import List
import re

class ContentAnalyzer:
    """Analyze web pages for AI visibility factors"""

    async def analyze_page(self, url: str) -> PageAnalysis:
        """Analyze a single page"""

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                html = response.text
            except Exception as e:
                raise Exception(f"Failed to fetch page: {str(e)}")

        soup = BeautifulSoup(html, 'html.parser')

        # Check for schema markup
        has_schema = bool(soup.find('script', type='application/ld+json'))

        # Check for FAQ sections
        has_faq = bool(
            soup.find(['div', 'section'], class_=re.compile(r'faq', re.I)) or
            soup.find(['h2', 'h3'], string=re.compile(r'faq|frequently asked', re.I))
        )

        # Calculate readability score (simplified)
        text_content = soup.get_text()
        words = text_content.split()
        sentences = text_content.count('.') + text_content.count('!') + text_content.count('?')
        if sentences > 0:
            avg_words_per_sentence = len(words) / sentences
            readability_score = max(0, min(100, 100 - (avg_words_per_sentence - 15)))
        else:
            readability_score = 0

        # Check meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        has_meta_desc = bool(meta_desc and meta_desc.get('content'))

        # Check headings structure
        h1_tags = soup.find_all('h1')
        has_proper_headings = len(h1_tags) == 1

        # Collect issues and strengths
        issues = []
        strengths = []

        if not has_schema:
            issues.append("No schema markup detected")
        else:
            strengths.append("Schema markup present")

        if not has_faq:
            issues.append("No FAQ section found")
        else:
            strengths.append("FAQ section detected")

        if not has_meta_desc:
            issues.append("Missing meta description")
        else:
            strengths.append("Meta description present")

        if not has_proper_headings:
            issues.append("Multiple or missing H1 tags")
        else:
            strengths.append("Proper heading structure")

        if avg_words_per_sentence > 25:
            issues.append(f"Long sentences (avg {avg_words_per_sentence:.0f} words)")

        # Calculate overall score
        score = 50  # Base score
        if has_schema:
            score += 20
        if has_faq:
            score += 15
        if has_meta_desc:
            score += 10
        if has_proper_headings:
            score += 5

        score = min(100, score)

        return PageAnalysis(
            url=url,
            score=score,
            has_schema=has_schema,
            has_faq=has_faq,
            readability_score=readability_score,
            page_speed=0,  # Would need PageSpeed API
            issues=issues,
            strengths=strengths
        )

    def generate_recommendations(self, pages: List[PageAnalysis]) -> List[str]:
        """Generate recommendations based on all pages"""
        recommendations = []

        # Count common issues
        no_schema_count = sum(1 for p in pages if not p.has_schema)
        no_faq_count = sum(1 for p in pages if not p.has_faq)

        if no_schema_count > len(pages) * 0.5:
            recommendations.append("Add schema markup to your pages using our Schema Generator tool")

        if no_faq_count > len(pages) * 0.5:
            recommendations.append("Add FAQ sections to answer common customer questions")

        avg_readability = sum(p.readability_score for p in pages) / len(pages) if pages else 0
        if avg_readability < 60:
            recommendations.append("Simplify your content - use shorter sentences and paragraphs")

        recommendations.append("Ensure all pages have unique, descriptive meta descriptions")
        recommendations.append("Use clear H1-H3 heading structure to organize content")

        return recommendations[:5]
