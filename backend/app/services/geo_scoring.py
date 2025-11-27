"""
GEO (Generative Engine Optimization) Scoring System

This is the "magic formula" for scoring AI visibility.
Based on research into what makes content get cited by AI engines like:
- ChatGPT / GPT-4
- Google Gemini / Bard
- Bing Chat / Copilot
- Perplexity
- Claude

The scoring system evaluates 6 key dimensions:
1. STRUCTURE (25%) - How well-organized is the content?
2. SCHEMA (20%) - Is there structured data for AI to parse?
3. AUTHORITY (15%) - Does content demonstrate expertise?
4. CITABILITY (20%) - Can AI easily quote this content?
5. FRESHNESS (10%) - Is content up-to-date?
6. ACCESSIBILITY (10%) - Can AI crawlers access the content?

Total: 100 points maximum
"""

from typing import Dict, Any, List, Tuple
from dataclasses import dataclass
from enum import Enum
import re
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ScoreCategory(Enum):
    """Score categories with weights"""
    STRUCTURE = 25      # Content organization
    SCHEMA = 20         # Structured data
    AUTHORITY = 15      # E-E-A-T signals
    CITABILITY = 20     # Quote-worthy content
    FRESHNESS = 10      # Up-to-date signals
    ACCESSIBILITY = 10  # Technical accessibility


@dataclass
class ScoreBreakdown:
    """Detailed score breakdown for transparency"""
    category: str
    max_points: int
    earned_points: float
    factors: List[Dict[str, Any]]
    
    @property
    def percentage(self) -> float:
        return (self.earned_points / self.max_points * 100) if self.max_points > 0 else 0


@dataclass
class GEOScore:
    """Complete GEO score result"""
    total_score: int
    grade: str
    breakdown: Dict[str, ScoreBreakdown]
    top_issues: List[str]
    quick_wins: List[str]
    competitive_edge: List[str]
    

class GEOScorer:
    """
    The Magic Formula for AI Visibility Scoring
    
    This scorer analyzes web pages and produces a consistent,
    research-backed score for how well content will perform
    in AI-powered search engines.
    """
    
    # Weights for each category (must sum to 100)
    WEIGHTS = {
        ScoreCategory.STRUCTURE: 25,
        ScoreCategory.SCHEMA: 20,
        ScoreCategory.AUTHORITY: 15,
        ScoreCategory.CITABILITY: 20,
        ScoreCategory.FRESHNESS: 10,
        ScoreCategory.ACCESSIBILITY: 10,
    }
    
    # Schema types that AI engines prioritize
    HIGH_VALUE_SCHEMAS = {
        'FAQPage': 10,
        'HowTo': 8,
        'Article': 6,
        'Product': 6,
        'Review': 5,
        'Recipe': 5,
        'Event': 4,
        'Organization': 4,
        'Person': 3,
        'WebPage': 2,
        'BreadcrumbList': 2,
    }
    
    def calculate_score(
        self,
        schema_data: Dict[str, Any],
        content_data: Dict[str, Any],
        seo_data: Dict[str, Any],
        structure_data: Dict[str, Any],
        technical_data: Dict[str, Any] = None
    ) -> GEOScore:
        """
        Calculate the complete GEO score
        
        Args:
            schema_data: Schema.org structured data analysis
            content_data: Content quality metrics
            seo_data: SEO elements analysis
            structure_data: Page structure analysis
            technical_data: Optional technical metrics (speed, etc.)
        
        Returns:
            GEOScore with total score, breakdown, and recommendations
        """
        breakdowns = {}
        all_issues = []
        all_quick_wins = []
        all_edges = []
        
        # 1. STRUCTURE SCORE (25 points)
        structure_score, structure_breakdown = self._score_structure(
            structure_data, content_data
        )
        breakdowns['structure'] = structure_breakdown
        all_issues.extend(structure_breakdown.factors)
        
        # 2. SCHEMA SCORE (20 points)
        schema_score, schema_breakdown = self._score_schema(schema_data)
        breakdowns['schema'] = schema_breakdown
        all_issues.extend(schema_breakdown.factors)
        
        # 3. AUTHORITY SCORE (15 points)
        authority_score, authority_breakdown = self._score_authority(
            content_data, seo_data, structure_data
        )
        breakdowns['authority'] = authority_breakdown
        all_issues.extend(authority_breakdown.factors)
        
        # 4. CITABILITY SCORE (20 points)
        citability_score, citability_breakdown = self._score_citability(
            content_data, structure_data
        )
        breakdowns['citability'] = citability_breakdown
        all_issues.extend(citability_breakdown.factors)
        
        # 5. FRESHNESS SCORE (10 points)
        freshness_score, freshness_breakdown = self._score_freshness(
            seo_data, content_data
        )
        breakdowns['freshness'] = freshness_breakdown
        all_issues.extend(freshness_breakdown.factors)
        
        # 6. ACCESSIBILITY SCORE (10 points)
        accessibility_score, accessibility_breakdown = self._score_accessibility(
            seo_data, structure_data, technical_data
        )
        breakdowns['accessibility'] = accessibility_breakdown
        all_issues.extend(accessibility_breakdown.factors)
        
        # Calculate total
        total_score = int(
            structure_score + 
            schema_score + 
            authority_score + 
            citability_score + 
            freshness_score + 
            accessibility_score
        )
        
        # Determine grade
        grade = self._calculate_grade(total_score)
        
        # Extract actionable insights
        issues = self._extract_issues(all_issues)
        quick_wins = self._extract_quick_wins(breakdowns)
        edges = self._extract_competitive_edges(breakdowns)
        
        return GEOScore(
            total_score=total_score,
            grade=grade,
            breakdown=breakdowns,
            top_issues=issues[:5],
            quick_wins=quick_wins[:3],
            competitive_edge=edges[:3]
        )
    
    def _score_structure(
        self, 
        structure: Dict[str, Any],
        content: Dict[str, Any]
    ) -> Tuple[float, ScoreBreakdown]:
        """
        Score content structure (25 points max)
        
        AI engines prefer well-organized content with:
        - Clear heading hierarchy (H1 → H2 → H3)
        - Logical content sections
        - Proper use of lists and paragraphs
        """
        points = 0
        factors = []
        max_points = 25
        
        # H1 tag (5 points)
        h1_count = structure.get('h1_count', 0)
        if h1_count == 1:
            points += 5
            factors.append({'factor': 'Single H1 tag', 'status': 'good', 'points': 5})
        elif h1_count == 0:
            factors.append({'factor': 'Missing H1 tag', 'status': 'critical', 'points': 0, 
                          'fix': 'Add a single H1 tag with your main topic'})
        else:
            points += 2
            factors.append({'factor': f'Multiple H1 tags ({h1_count})', 'status': 'warning', 'points': 2,
                          'fix': 'Use only one H1 tag per page'})
        
        # H2 subheadings (5 points)
        h2_count = structure.get('h2_count', 0)
        if h2_count >= 3:
            points += 5
            factors.append({'factor': f'{h2_count} H2 subheadings', 'status': 'good', 'points': 5})
        elif h2_count >= 1:
            points += 3
            factors.append({'factor': f'Only {h2_count} H2 subheading(s)', 'status': 'warning', 'points': 3,
                          'fix': 'Add more H2 subheadings to break up content'})
        else:
            factors.append({'factor': 'No H2 subheadings', 'status': 'critical', 'points': 0,
                          'fix': 'Add H2 subheadings for key sections'})
        
        # Heading hierarchy (5 points)
        h3_count = structure.get('h3_count', 0)
        if h2_count > 0 and h3_count > 0:
            points += 5
            factors.append({'factor': 'Good heading hierarchy', 'status': 'good', 'points': 5})
        elif h2_count > 0:
            points += 3
            factors.append({'factor': 'Basic heading structure', 'status': 'ok', 'points': 3})
        
        # Content depth - word count (5 points) - more generous thresholds
        word_count = content.get('word_count', 0)
        if word_count >= 1000:
            points += 5
            factors.append({'factor': f'Comprehensive content ({word_count} words)', 'status': 'good', 'points': 5})
        elif word_count >= 500:
            points += 4
            factors.append({'factor': f'Good content depth ({word_count} words)', 'status': 'good', 'points': 4})
        elif word_count >= 200:
            points += 3
            factors.append({'factor': f'Moderate content ({word_count} words)', 'status': 'ok', 'points': 3,
                          'fix': 'Consider expanding content for better AI coverage'})
        elif word_count >= 100:
            points += 2
            factors.append({'factor': f'Light content ({word_count} words)', 'status': 'warning', 'points': 2})
        else:
            points += 1
            factors.append({'factor': f'Minimal content ({word_count} words)', 'status': 'warning', 'points': 1,
                          'fix': 'Add more content for AI to extract information'})
        
        # Internal linking (5 points)
        internal_links = structure.get('internal_links', 0)
        if internal_links >= 5:
            points += 5
            factors.append({'factor': f'{internal_links} internal links', 'status': 'good', 'points': 5})
        elif internal_links >= 2:
            points += 3
            factors.append({'factor': f'{internal_links} internal links', 'status': 'ok', 'points': 3,
                          'fix': 'Add more internal links to related content'})
        else:
            points += 1
            factors.append({'factor': 'Few internal links', 'status': 'warning', 'points': 1,
                          'fix': 'Add internal links to help AI understand content relationships'})
        
        return points, ScoreBreakdown(
            category='Structure',
            max_points=max_points,
            earned_points=points,
            factors=factors
        )
    
    def _score_schema(self, schema: Dict[str, Any]) -> Tuple[float, ScoreBreakdown]:
        """
        Score structured data (20 points max)
        
        Schema.org markup is CRITICAL for AI visibility.
        AI engines heavily rely on structured data to understand content.
        """
        points = 0
        factors = []
        max_points = 20
        
        has_schema = schema.get('has_schema', False)
        schema_types = schema.get('types', [])
        schema_count = schema.get('count', 0)
        
        if not has_schema:
            # Give base points even without schema - many good sites lack formal schema
            base_points = 4
            factors.append({
                'factor': 'No formal structured data detected',
                'status': 'opportunity',
                'points': base_points,
                'fix': 'Add JSON-LD schema markup for better AI visibility'
            })
            return base_points, ScoreBreakdown(
                category='Schema',
                max_points=max_points,
                earned_points=base_points,
                factors=factors
            )
        
        # Base points for having schema (5 points)
        points += 5
        factors.append({'factor': 'Structured data present', 'status': 'good', 'points': 5})
        
        # Points for high-value schema types (up to 10 points)
        schema_points = 0
        found_types = []
        for schema_type in schema_types:
            if schema_type in self.HIGH_VALUE_SCHEMAS:
                type_points = self.HIGH_VALUE_SCHEMAS[schema_type]
                schema_points += type_points
                found_types.append(f"{schema_type} (+{type_points})")
        
        schema_points = min(schema_points, 10)  # Cap at 10
        points += schema_points
        
        if found_types:
            factors.append({
                'factor': f'High-value schemas: {", ".join(found_types)}',
                'status': 'good',
                'points': schema_points
            })
        
        # Bonus for FAQPage (5 points) - AI LOVES FAQs
        if 'FAQPage' in schema_types:
            points += 5
            factors.append({
                'factor': 'FAQPage schema (AI favorite)',
                'status': 'excellent',
                'points': 5
            })
        else:
            factors.append({
                'factor': 'No FAQ schema',
                'status': 'opportunity',
                'points': 0,
                'fix': 'Add FAQPage schema - AI engines prioritize FAQ content for answers'
            })
        
        return min(points, max_points), ScoreBreakdown(
            category='Schema',
            max_points=max_points,
            earned_points=min(points, max_points),
            factors=factors
        )
    
    def _score_authority(
        self,
        content: Dict[str, Any],
        seo: Dict[str, Any],
        structure: Dict[str, Any]
    ) -> Tuple[float, ScoreBreakdown]:
        """
        Score authority signals (15 points max)
        
        E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness
        AI engines look for signals that content is authoritative.
        """
        points = 0
        factors = []
        max_points = 15
        
        # Author information (5 points)
        # Check for author-related patterns in content or structure
        has_author = seo.get('has_author', False) or content.get('has_author_info', False)
        if has_author:
            points += 5
            factors.append({'factor': 'Author information present', 'status': 'good', 'points': 5})
        else:
            # Partial credit - many legitimate sites don't have explicit author info
            points += 2
            factors.append({
                'factor': 'No explicit author information',
                'status': 'opportunity',
                'points': 2,
                'fix': 'Add author name and bio to establish expertise'
            })
        
        # External references/citations (5 points)
        external_links = structure.get('external_links', 0)
        if external_links >= 3:
            points += 5
            factors.append({'factor': f'{external_links} external references', 'status': 'good', 'points': 5})
        elif external_links >= 1:
            points += 4
            factors.append({'factor': f'{external_links} external reference(s)', 'status': 'ok', 'points': 4})
        else:
            # Partial credit - not all pages need external links
            points += 2
            factors.append({
                'factor': 'No external references',
                'status': 'opportunity',
                'points': 2,
                'fix': 'Consider adding citations to authoritative sources'
            })
        
        # Organization/brand signals (5 points)
        has_org_schema = 'Organization' in str(content.get('schema_types', []))
        has_about = seo.get('has_about_page', False)
        
        if has_org_schema:
            points += 3
            factors.append({'factor': 'Organization schema', 'status': 'good', 'points': 3})
        
        if seo.get('has_og_tags', False):
            points += 2
            factors.append({'factor': 'Open Graph tags', 'status': 'good', 'points': 2})
        
        return min(points, max_points), ScoreBreakdown(
            category='Authority',
            max_points=max_points,
            earned_points=min(points, max_points),
            factors=factors
        )
    
    def _score_citability(
        self,
        content: Dict[str, Any],
        structure: Dict[str, Any]
    ) -> Tuple[float, ScoreBreakdown]:
        """
        Score citability (20 points max)
        
        How easily can AI quote your content?
        AI engines prefer content that's easy to extract and cite.
        """
        points = 0
        factors = []
        max_points = 20
        
        # FAQ content (7 points) - MOST CITABLE FORMAT
        has_faq = content.get('has_faq', False)
        if has_faq:
            points += 7
            factors.append({
                'factor': 'FAQ section detected',
                'status': 'excellent',
                'points': 7,
                'note': 'FAQs are the most citable format for AI'
            })
        else:
            # Give partial credit - FAQ is a bonus, not a requirement
            points += 2
            factors.append({
                'factor': 'No FAQ section (opportunity)',
                'status': 'opportunity',
                'points': 2,
                'fix': 'Add FAQ section - AI loves to cite Q&A format'
            })
        
        # Readability (5 points)
        readability = content.get('readability_score', 0)
        if readability >= 70:
            points += 5
            factors.append({'factor': 'Excellent readability', 'status': 'good', 'points': 5})
        elif readability >= 50:
            points += 3
            factors.append({'factor': 'Good readability', 'status': 'ok', 'points': 3})
        else:
            factors.append({
                'factor': 'Poor readability',
                'status': 'warning',
                'points': 0,
                'fix': 'Simplify sentences - aim for 15-20 words per sentence'
            })
        
        # Sentence structure (4 points)
        avg_sentence_length = content.get('avg_words_per_sentence', 0)
        if 10 <= avg_sentence_length <= 20:
            points += 4
            factors.append({'factor': 'Optimal sentence length', 'status': 'good', 'points': 4})
        elif 8 <= avg_sentence_length <= 25:
            points += 2
            factors.append({'factor': 'Acceptable sentence length', 'status': 'ok', 'points': 2})
        else:
            factors.append({
                'factor': f'Suboptimal sentences ({avg_sentence_length:.0f} words avg)',
                'status': 'warning',
                'points': 0,
                'fix': 'Keep sentences between 10-20 words for best citability'
            })
        
        # Definition-style content (4 points)
        # AI loves content that directly answers "what is X"
        word_count = content.get('word_count', 0)
        sentence_count = content.get('sentence_count', 0)
        
        if sentence_count > 0 and word_count > 300:
            # Good content depth with reasonable sentences
            points += 4
            factors.append({'factor': 'Good content structure', 'status': 'good', 'points': 4})
        elif sentence_count > 0:
            points += 2
            factors.append({'factor': 'Basic content structure', 'status': 'ok', 'points': 2})
        
        return min(points, max_points), ScoreBreakdown(
            category='Citability',
            max_points=max_points,
            earned_points=min(points, max_points),
            factors=factors
        )
    
    def _score_freshness(
        self,
        seo: Dict[str, Any],
        content: Dict[str, Any]
    ) -> Tuple[float, ScoreBreakdown]:
        """
        Score content freshness (10 points max)
        
        AI engines prefer up-to-date content.
        """
        points = 0
        factors = []
        max_points = 10
        
        # Date signals (5 points)
        has_date = seo.get('has_date_published', False) or seo.get('has_date_modified', False)
        if has_date:
            points += 5
            factors.append({'factor': 'Publication date present', 'status': 'good', 'points': 5})
        else:
            # Many good sites don't have explicit dates - partial credit
            points += 2
            factors.append({
                'factor': 'No explicit publication date',
                'status': 'opportunity',
                'points': 2,
                'fix': 'Consider adding datePublished and dateModified to schema'
            })
        
        # Recent year mentions (3 points)
        current_year = datetime.now().year
        recent_years = [str(current_year), str(current_year - 1)]
        content_text = str(content.get('text_sample', ''))
        
        has_recent_year = any(year in content_text for year in recent_years)
        if has_recent_year:
            points += 3
            factors.append({'factor': 'Content mentions recent dates', 'status': 'good', 'points': 3})
        
        # Last modified header (2 points)
        if seo.get('has_last_modified', False):
            points += 2
            factors.append({'factor': 'Last-Modified header', 'status': 'good', 'points': 2})
        
        return min(points, max_points), ScoreBreakdown(
            category='Freshness',
            max_points=max_points,
            earned_points=min(points, max_points),
            factors=factors
        )
    
    def _score_accessibility(
        self,
        seo: Dict[str, Any],
        structure: Dict[str, Any],
        technical: Dict[str, Any] = None
    ) -> Tuple[float, ScoreBreakdown]:
        """
        Score technical accessibility (10 points max)
        
        Can AI crawlers access and parse the content?
        """
        points = 0
        factors = []
        max_points = 10
        
        # Meta description (3 points)
        if seo.get('has_meta_desc', False):
            meta_len = seo.get('meta_desc_length', 0)
            if 120 <= meta_len <= 160:
                points += 3
                factors.append({'factor': 'Optimal meta description', 'status': 'good', 'points': 3})
            else:
                points += 2
                factors.append({'factor': 'Meta description present', 'status': 'ok', 'points': 2})
        else:
            factors.append({
                'factor': 'Missing meta description',
                'status': 'critical',
                'points': 0,
                'fix': 'Add meta description (150-160 characters)'
            })
        
        # Title tag (2 points)
        title_len = seo.get('title_length', 0)
        if 30 <= title_len <= 60:
            points += 2
            factors.append({'factor': 'Optimal title length', 'status': 'good', 'points': 2})
        elif title_len > 0:
            points += 1
            factors.append({'factor': 'Title present', 'status': 'ok', 'points': 1})
        else:
            factors.append({'factor': 'Missing title', 'status': 'critical', 'points': 0})
        
        # Canonical URL (2 points)
        if seo.get('has_canonical', False):
            points += 2
            factors.append({'factor': 'Canonical URL set', 'status': 'good', 'points': 2})
        
        # Images with alt text (3 points)
        total_images = structure.get('total_images', 0)
        images_with_alt = structure.get('images_with_alt', 0)
        
        if total_images > 0:
            alt_ratio = images_with_alt / total_images
            if alt_ratio >= 0.8:
                points += 3
                factors.append({'factor': 'Images have alt text', 'status': 'good', 'points': 3})
            elif alt_ratio >= 0.5:
                points += 2
                factors.append({'factor': 'Some images lack alt text', 'status': 'warning', 'points': 2})
            else:
                factors.append({
                    'factor': 'Most images lack alt text',
                    'status': 'warning',
                    'points': 0,
                    'fix': 'Add alt text to all images'
                })
        else:
            points += 3  # No images is fine
        
        return min(points, max_points), ScoreBreakdown(
            category='Accessibility',
            max_points=max_points,
            earned_points=min(points, max_points),
            factors=factors
        )
    
    def _calculate_grade(self, score: int) -> str:
        """Convert score to letter grade - recalibrated for realistic expectations"""
        if score >= 85:
            return 'A+'
        elif score >= 75:
            return 'A'
        elif score >= 65:
            return 'B+'
        elif score >= 55:
            return 'B'
        elif score >= 45:
            return 'C+'
        elif score >= 35:
            return 'C'
        elif score >= 25:
            return 'D'
        else:
            return 'F'
    
    def _extract_issues(self, factors: List[Dict]) -> List[str]:
        """Extract top issues from all factors"""
        issues = []
        for factor in factors:
            if isinstance(factor, dict):
                if factor.get('status') in ['critical', 'warning'] and factor.get('fix'):
                    issues.append(factor['fix'])
        return issues
    
    def _extract_quick_wins(self, breakdowns: Dict[str, ScoreBreakdown]) -> List[str]:
        """Identify quick wins - easy fixes with high impact"""
        quick_wins = []
        
        # Schema is usually the biggest quick win
        schema = breakdowns.get('schema')
        if schema and schema.earned_points < 10:
            quick_wins.append("Add JSON-LD schema markup (+15-20 points possible)")
        
        # FAQ is another quick win
        citability = breakdowns.get('citability')
        if citability:
            for factor in citability.factors:
                if isinstance(factor, dict) and 'FAQ' in str(factor.get('factor', '')):
                    if factor.get('status') == 'opportunity':
                        quick_wins.append("Add FAQ section with common questions (+7 points)")
                        break
        
        # Meta description
        accessibility = breakdowns.get('accessibility')
        if accessibility:
            for factor in accessibility.factors:
                if isinstance(factor, dict) and 'meta description' in str(factor.get('factor', '')).lower():
                    if factor.get('status') == 'critical':
                        quick_wins.append("Add meta description (+3 points)")
                        break
        
        return quick_wins
    
    def _extract_competitive_edges(self, breakdowns: Dict[str, ScoreBreakdown]) -> List[str]:
        """Identify strengths that give competitive advantage"""
        edges = []
        
        for category, breakdown in breakdowns.items():
            percentage = breakdown.percentage
            if percentage >= 80:
                edges.append(f"Strong {category}: {percentage:.0f}% optimized")
        
        return edges


# Singleton instance
geo_scorer = GEOScorer()

