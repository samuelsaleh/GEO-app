"""
Speed Test Service

The core engine for the AI Visibility Score feature.
Runs parallel AI queries across multiple models to test brand visibility.
"""

import asyncio
import re
import time
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

from app.models.speed_test import (
    ScoreRequest, ScoreResponse, ModelResult, PromptResult,
    CompetitorInfo, ModelBreakdown, PromptCategory,
    get_category_config, CATEGORY_CONFIG
)

# Import AI service
try:
    from app.services.ai_service import ai_service
except ImportError:
    ai_service = None

logger = logging.getLogger(__name__)


class SpeedTestService:
    """
    AI Visibility Score Service
    
    Runs comprehensive visibility tests across multiple AI models.
    Target: Complete test in under 15 seconds.
    """
    
    # Fast, cheap models for speed testing
    MODELS = [
        {"id": "gpt-4o-mini", "provider": "openai", "name": "ChatGPT", "icon": "🤖"},
        {"id": "claude-3-haiku-20240307", "provider": "anthropic", "name": "Claude", "icon": "🧠"},
        {"id": "gemini-1.5-flash", "provider": "google", "name": "Gemini", "icon": "💎"},
    ]
    
    # System prompt to encourage brand mentions
    SYSTEM_PROMPT = """You are a helpful shopping and product advisor. When someone asks for recommendations:
1. Always mention specific brand names
2. Explain why you recommend each brand
3. List brands in order of your recommendation
4. Be specific and helpful

Provide genuine, useful recommendations based on quality, value, and reputation."""

    def __init__(self):
        self.ai_service = ai_service
    
    async def run_test(
        self,
        brand: str,
        category: str,
        location: Optional[str] = None
    ) -> ScoreResponse:
        """
        Main entry point - runs complete visibility test.
        
        Args:
            brand: Brand name to test (e.g., "Nike")
            category: Product/service category (e.g., "running shoes")
            location: Optional location for local businesses
        
        Returns:
            ScoreResponse with complete test results
        """
        start_time = time.time()
        
        # 1. Generate smart prompts
        prompts = self._generate_prompts(brand, category, location)
        logger.info(f"Generated {len(prompts)} prompts for {brand} in {category}")
        
        # 2. Run ALL queries in parallel
        all_results = await self._query_all_parallel(prompts, brand)
        
        # Filter out errors
        valid_results = [r for r in all_results if r and not r.error]
        logger.info(f"Got {len(valid_results)} valid results from {len(all_results)} queries")
        
        # 3. Calculate score and analyze results
        score, verdict, verdict_emoji, grade = self._calculate_score(valid_results)
        competitors = self._extract_competitors(valid_results, brand)
        prompt_results = self._group_by_prompt(prompts, all_results)
        model_breakdown = self._calculate_model_breakdown(all_results)
        worst_prompt = self._find_worst_prompt(prompt_results)
        killer_quote = self._extract_killer_quote(valid_results, brand, competitors)
        example_response = self._get_example_response(valid_results, brand)
        
        # 4. Calculate comparison with top competitor
        you_vs_top = None
        if competitors:
            top_comp = competitors[0]
            you_vs_top = {
                "competitor": top_comp.name,
                "their_rate": top_comp.rate,
                "your_rate": int(len([r for r in valid_results if r.mentioned]) / len(valid_results) * 100) if valid_results else 0,
                "gap": top_comp.rate - (int(len([r for r in valid_results if r.mentioned]) / len(valid_results) * 100) if valid_results else 0)
            }
        
        # 5. Generate share text
        mention_rate = len([r for r in valid_results if r.mentioned]) / len(valid_results) if valid_results else 0
        share_text = self._generate_share_text(brand, category, score, competitors, mention_rate)
        
        # 6. Build response
        test_duration_ms = int((time.time() - start_time) * 1000)
        
        return ScoreResponse(
            score=score,
            verdict=verdict,
            verdict_emoji=verdict_emoji,
            grade=grade,
            brand=brand,
            category=category,
            location=location,
            total_tests=len(all_results),
            total_mentions=len([r for r in valid_results if r.mentioned]),
            mention_rate=mention_rate,
            prompt_results=prompt_results,
            model_breakdown=model_breakdown,
            competitors=competitors,
            you_vs_top=you_vs_top,
            worst_prompt=worst_prompt,
            killer_quote=killer_quote,
            example_response=example_response,
            share_text=share_text,
            tested_at=datetime.now(),
            test_duration_ms=test_duration_ms
        )
    
    def _generate_prompts(
        self,
        brand: str,
        category: str,
        location: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Generate diverse prompts covering different search intents"""
        
        prompts = [
            {
                "text": f"What are the best {category}?",
                "category": PromptCategory.RECOMMENDATION
            },
            {
                "text": f"Top {category} brands in 2025",
                "category": PromptCategory.RECOMMENDATION
            },
            {
                "text": f"Is {brand} good for {category}? What are the alternatives?",
                "category": PromptCategory.REPUTATION
            },
            {
                "text": f"Where should I buy {category}? What brands do you recommend?",
                "category": PromptCategory.PURCHASE
            },
        ]
        
        # Add location-specific prompt if provided
        if location:
            prompts.append({
                "text": f"Best {category} in {location}",
                "category": PromptCategory.RECOMMENDATION
            })
        
        return prompts[:4]  # Max 4 prompts for speed
    
    async def _query_all_parallel(
        self,
        prompts: List[Dict[str, Any]],
        brand: str
    ) -> List[ModelResult]:
        """Run ALL AI queries in parallel using asyncio.gather"""
        
        tasks = []
        
        for prompt in prompts:
            for model in self.MODELS:
                task = self._query_single_model(
                    prompt=prompt["text"],
                    prompt_category=prompt["category"],
                    model=model,
                    brand=brand
                )
                tasks.append(task)
        
        # Run all queries simultaneously
        logger.info(f"Running {len(tasks)} AI queries in parallel...")
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Convert exceptions to error results
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Query {i} failed: {result}")
                # Create error result
                prompt_idx = i // len(self.MODELS)
                model_idx = i % len(self.MODELS)
                processed_results.append(ModelResult(
                    model_id=self.MODELS[model_idx]["id"],
                    model_name=self.MODELS[model_idx]["name"],
                    provider=self.MODELS[model_idx]["provider"],
                    mentioned=False,
                    prompt=prompts[prompt_idx]["text"],
                    error=str(result)
                ))
            else:
                processed_results.append(result)
        
        return processed_results
    
    async def _query_single_model(
        self,
        prompt: str,
        prompt_category: PromptCategory,
        model: Dict[str, str],
        brand: str
    ) -> ModelResult:
        """Query a single AI model and analyze the response"""
        
        start = time.time()
        response = ""
        error = None
        
        try:
            if not self.ai_service:
                raise Exception("AI service not available")
            
            response = await self.ai_service.generate_with_model(
                prompt=prompt,
                system_prompt=self.SYSTEM_PROMPT,
                model=model["id"],
                provider=model["provider"],
                max_tokens=600,
                temperature=0.3
            )
            
            if not response:
                response = ""
                error = "Empty response from model"
                
        except Exception as e:
            logger.error(f"Error querying {model['name']}: {e}")
            error = str(e)
            response = ""
        
        # Analyze the response
        mentioned = self._brand_in_response(brand, response) if response else False
        position = self._find_position(brand, response) if mentioned else None
        competitors = self._extract_brands_from_response(response, brand) if response else []
        sentiment = self._analyze_sentiment(response, brand) if mentioned else "neutral"
        killer_quote = self._extract_relevant_sentence(response, competitors) if response else None
        
        return ModelResult(
            model_id=model["id"],
            model_name=model["name"],
            provider=model["provider"],
            mentioned=mentioned,
            position=position,
            sentiment=sentiment,
            competitors_found=competitors,
            killer_quote=killer_quote,
            full_response=response,
            response_time_ms=int((time.time() - start) * 1000),
            prompt=prompt,
            error=error
        )
    
    def _brand_in_response(self, brand: str, response: str) -> bool:
        """Check if brand is mentioned in response with fuzzy matching"""
        if not response:
            return False
        
        response_lower = response.lower()
        brand_lower = brand.lower()
        
        # Direct match
        if brand_lower in response_lower:
            return True
        
        # Match without spaces (e.g., "NewBalance" matches "New Balance")
        brand_no_space = brand_lower.replace(" ", "")
        response_no_space = response_lower.replace(" ", "")
        if brand_no_space in response_no_space:
            return True
        
        # Match with common variations
        brand_hyphenated = brand_lower.replace(" ", "-")
        if brand_hyphenated in response_lower:
            return True
        
        return False
    
    def _find_position(self, brand: str, response: str) -> Optional[int]:
        """Find the position of the brand mention (1st, 2nd, 3rd, etc.)"""
        if not response:
            return None
        
        # Look for numbered lists
        lines = response.split('\n')
        brand_lower = brand.lower()
        
        for i, line in enumerate(lines):
            line_lower = line.lower()
            
            # Check if this line contains the brand
            if brand_lower in line_lower or brand_lower.replace(" ", "") in line_lower.replace(" ", ""):
                # Try to extract position from numbered list
                match = re.match(r'^[\s]*(\d+)[.\):\-]', line)
                if match:
                    return int(match.group(1))
                
                # Check for bullet points and count position
                if line.strip().startswith(('-', '*', '•')):
                    # Count bullet points before this one
                    bullet_count = 0
                    for j in range(i + 1):
                        if lines[j].strip().startswith(('-', '*', '•')):
                            bullet_count += 1
                    return bullet_count
        
        # If no numbered list, find first mention position
        response_lower = response.lower()
        brand_pos = response_lower.find(brand_lower)
        
        if brand_pos == -1:
            return None
        
        # Count how many other brand-like words appear before
        text_before = response_lower[:brand_pos]
        # Simple heuristic: count capitalized words that might be brands
        potential_brands = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', response[:brand_pos])
        
        return len(potential_brands) + 1
    
    def _extract_brands_from_response(self, response: str, user_brand: str) -> List[str]:
        """Extract brand names mentioned in the response"""
        if not response:
            return []
        
        brands_found = []
        user_brand_lower = user_brand.lower()
        
        # Common brand indicators
        brand_patterns = [
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b',  # Capitalized words
            r'(?:recommend|suggest|try|consider|check out)\s+([A-Z][a-zA-Z\s]+)',  # After recommendation words
            r'(?:\d+[.\)]\s*)([A-Z][a-zA-Z\s]+)',  # In numbered lists
        ]
        
        for pattern in brand_patterns:
            matches = re.findall(pattern, response)
            for match in matches:
                # Clean up the match
                brand = match.strip()
                brand_lower = brand.lower()
                
                # Filter out common non-brand words
                skip_words = [
                    'the', 'and', 'for', 'with', 'this', 'that', 'these', 'those',
                    'here', 'there', 'when', 'what', 'which', 'who', 'how', 'why',
                    'best', 'top', 'great', 'good', 'nice', 'quality', 'price',
                    'overall', 'however', 'although', 'because', 'since', 'while',
                    'running', 'shoes', 'brand', 'brands', 'product', 'products',
                    'option', 'options', 'choice', 'choices', 'alternative',
                    'i', 'you', 'we', 'they', 'it', 'my', 'your', 'our', 'their'
                ]
                
                if brand_lower in skip_words:
                    continue
                
                # Skip if it's the user's brand
                if brand_lower == user_brand_lower:
                    continue
                
                # Skip very short or very long matches
                if len(brand) < 3 or len(brand) > 30:
                    continue
                
                # Skip if contains numbers (probably not a brand)
                if re.search(r'\d', brand):
                    continue
                
                if brand not in brands_found:
                    brands_found.append(brand)
        
        # Limit to top 10 most likely brands
        return brands_found[:10]
    
    def _analyze_sentiment(self, response: str, brand: str) -> str:
        """Analyze sentiment of brand mention in response"""
        if not response:
            return "neutral"
        
        response_lower = response.lower()
        brand_lower = brand.lower()
        
        # Find sentences containing the brand
        sentences = re.split(r'[.!?]', response)
        brand_sentences = [s for s in sentences if brand_lower in s.lower()]
        
        if not brand_sentences:
            return "neutral"
        
        text = ' '.join(brand_sentences).lower()
        
        # Positive indicators
        positive_words = [
            'best', 'excellent', 'great', 'top', 'leading', 'recommend',
            'outstanding', 'innovative', 'quality', 'trusted', 'reliable',
            'popular', 'favorite', 'preferred', 'award', 'premium',
            'highly', 'loved', 'amazing', 'fantastic', 'superior'
        ]
        
        # Negative indicators
        negative_words = [
            'bad', 'poor', 'avoid', 'problem', 'issue', 'complaint',
            'expensive', 'overpriced', 'disappointing', 'lacks', 'limited',
            'controversy', 'criticism', 'negative', 'worst', 'inferior',
            'cheap', 'low-quality', 'unreliable'
        ]
        
        positive_count = sum(1 for w in positive_words if w in text)
        negative_count = sum(1 for w in negative_words if w in text)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        return "neutral"
    
    def _extract_relevant_sentence(
        self,
        response: str,
        competitors: List[str]
    ) -> Optional[str]:
        """Extract the most relevant/shareable sentence from response"""
        if not response:
            return None
        
        sentences = re.split(r'[.!?]', response)
        
        # Priority 1: Sentence with recommendation + competitor
        for sentence in sentences:
            sentence_lower = sentence.lower()
            has_recommendation = any(w in sentence_lower for w in ['recommend', 'suggest', 'best', 'top'])
            has_competitor = any(comp.lower() in sentence_lower for comp in competitors[:3])
            
            if has_recommendation and has_competitor:
                return sentence.strip() + "."
        
        # Priority 2: First sentence with a competitor
        for sentence in sentences:
            if any(comp.lower() in sentence.lower() for comp in competitors[:3]):
                return sentence.strip() + "."
        
        # Priority 3: First substantial sentence
        for sentence in sentences:
            if len(sentence.strip()) > 50:
                return sentence.strip() + "."
        
        return None
    
    def _calculate_score(self, results: List[ModelResult]) -> Tuple[int, str, str, str]:
        """
        Calculate visibility score with bonus factors.
        
        Score formula:
        - Base: mention_rate * 60 (0-60 points)
        - Position bonus: +20 if avg position <= 2
        - Sentiment bonus: +10 if mostly positive
        - Consistency bonus: +10 if mentioned across multiple providers
        """
        if not results:
            return 0, "invisible", "🔴", "F"
        
        mentions = sum(1 for r in results if r.mentioned)
        total = len(results)
        mention_rate = mentions / total if total > 0 else 0
        
        # Base score (60% weight)
        base = mention_rate * 60
        
        # Position bonus (20% weight)
        positions = [r.position for r in results if r.position]
        avg_position = sum(positions) / len(positions) if positions else 10
        position_bonus = 20 if avg_position <= 2 else (10 if avg_position <= 4 else 0)
        
        # Sentiment bonus (10% weight)
        sentiments = [r.sentiment for r in results if r.mentioned]
        positive_rate = sentiments.count("positive") / len(sentiments) if sentiments else 0
        sentiment_bonus = 10 if positive_rate > 0.5 else (5 if positive_rate > 0.25 else 0)
        
        # Consistency bonus (10% weight)
        providers = set(r.provider for r in results if r.mentioned)
        consistency_bonus = 10 if len(providers) >= 2 else (5 if len(providers) >= 1 else 0)
        
        score = min(100, int(base + position_bonus + sentiment_bonus + consistency_bonus))
        
        # Get verdict
        verdict, verdict_emoji, grade = self._get_verdict(score)
        
        return score, verdict, verdict_emoji, grade
    
    def _get_verdict(self, score: int) -> Tuple[str, str, str]:
        """Map score to verdict, emoji, and grade"""
        if score < 20:
            return "invisible", "🔴", "F"
        elif score < 40:
            return "ghost", "🟠", "D"
        elif score < 60:
            return "contender", "🟡", "C"
        elif score < 80:
            return "visible", "🟢", "B"
        else:
            return "authority", "💚", "A"
    
    def _extract_competitors(
        self,
        results: List[ModelResult],
        brand: str
    ) -> List[CompetitorInfo]:
        """Find all competitors mentioned and rank by frequency"""
        competitor_counts: Dict[str, int] = {}
        brand_lower = brand.lower()
        
        for result in results:
            for comp in result.competitors_found:
                comp_lower = comp.lower()
                # Skip user's brand
                if comp_lower == brand_lower or brand_lower in comp_lower:
                    continue
                
                # Normalize competitor name
                comp_normalized = comp.title()
                competitor_counts[comp_normalized] = competitor_counts.get(comp_normalized, 0) + 1
        
        # Sort by mention count
        sorted_comps = sorted(competitor_counts.items(), key=lambda x: x[1], reverse=True)
        
        total = len(results)
        return [
            CompetitorInfo(
                name=name,
                mentions=count,
                rate=round(count / total * 100) if total > 0 else 0
            )
            for name, count in sorted_comps[:5]
        ]
    
    def _group_by_prompt(
        self,
        prompts: List[Dict[str, Any]],
        results: List[ModelResult]
    ) -> List[PromptResult]:
        """Group results by prompt"""
        prompt_results = []
        
        for prompt in prompts:
            prompt_text = prompt["text"]
            prompt_category = prompt["category"]
            
            # Find results for this prompt
            matching_results = [r for r in results if r.prompt == prompt_text]
            
            # Calculate mention rate for this prompt
            mentions = sum(1 for r in matching_results if r.mentioned)
            total = len(matching_results)
            mention_rate = mentions / total if total > 0 else 0
            
            # Find best position
            positions = [r.position for r in matching_results if r.position]
            best_position = min(positions) if positions else None
            
            prompt_results.append(PromptResult(
                prompt=prompt_text,
                category=prompt_category,
                models=matching_results,
                mention_rate=mention_rate,
                best_position=best_position
            ))
        
        return prompt_results
    
    def _calculate_model_breakdown(self, results: List[ModelResult]) -> List[ModelBreakdown]:
        """Calculate performance breakdown by model"""
        model_stats: Dict[str, Dict[str, Any]] = {}
        
        for result in results:
            model_id = result.model_id
            if model_id not in model_stats:
                model_stats[model_id] = {
                    "model_name": result.model_name,
                    "provider": result.provider,
                    "mentions": 0,
                    "total": 0
                }
            
            model_stats[model_id]["total"] += 1
            if result.mentioned:
                model_stats[model_id]["mentions"] += 1
        
        return [
            ModelBreakdown(
                model_id=model_id,
                model_name=stats["model_name"],
                provider=stats["provider"],
                mentions=stats["mentions"],
                total=stats["total"],
                rate=round(stats["mentions"] / stats["total"] * 100) if stats["total"] > 0 else 0
            )
            for model_id, stats in model_stats.items()
        ]
    
    def _find_worst_prompt(self, prompt_results: List[PromptResult]) -> Optional[Dict[str, Any]]:
        """Find the prompt where brand performed worst"""
        if not prompt_results:
            return None
        
        # Sort by mention rate (ascending)
        sorted_prompts = sorted(prompt_results, key=lambda x: x.mention_rate)
        
        worst = sorted_prompts[0]
        return {
            "prompt": worst.prompt,
            "category": worst.category.value,
            "mention_rate": worst.mention_rate,
            "models_mentioning": sum(1 for m in worst.models if m.mentioned),
            "total_models": len(worst.models)
        }
    
    def _extract_killer_quote(
        self,
        results: List[ModelResult],
        brand: str,
        competitors: List[CompetitorInfo]
    ) -> Optional[str]:
        """Find the most impactful quote showing competitor over user"""
        
        # Find a response where competitor is mentioned but user isn't
        for result in results:
            if not result.mentioned and result.competitors_found:
                top_comp = result.competitors_found[0]
                return f'When asked "{result.prompt}", {result.model_name} recommended {top_comp}. You were not mentioned.'
        
        # If user is always mentioned, find where they're ranked low
        for result in results:
            if result.mentioned and result.position and result.position > 3:
                return f'When asked "{result.prompt}", {result.model_name} mentioned you at position #{result.position}.'
        
        # If no bad results, return None (user is doing well!)
        return None
    
    def _get_example_response(
        self,
        results: List[ModelResult],
        brand: str
    ) -> Optional[Dict[str, Any]]:
        """Get an example AI response to show the user"""
        
        # Prefer a response where brand is NOT mentioned (more impactful)
        for result in results:
            if not result.mentioned and result.full_response and not result.error:
                return {
                    "prompt": result.prompt,
                    "response": result.full_response[:500] + "..." if len(result.full_response) > 500 else result.full_response,
                    "model": result.model_name,
                    "mentioned": False
                }
        
        # Fall back to any response with content
        for result in results:
            if result.full_response and not result.error:
                return {
                    "prompt": result.prompt,
                    "response": result.full_response[:500] + "..." if len(result.full_response) > 500 else result.full_response,
                    "model": result.model_name,
                    "mentioned": result.mentioned
                }
        
        return None
    
    def _generate_share_text(
        self,
        brand: str,
        category: str,
        score: int,
        competitors: List[CompetitorInfo],
        mention_rate: float
    ) -> str:
        """Generate viral share text for LinkedIn"""
        
        if score < 30:
            # Bad score - trigger concern
            top_comp = competitors[0].name if competitors else "competitors"
            return f"""I just checked my AI Visibility Score with Dwight — only {score}%! 😱

When people ask AI for "{category}", {top_comp} shows up but {brand} doesn't.

{int(mention_rate * 100)}% of AI models recommend my competitors over me.

Check your brand's AI visibility for free 👇
"""
        elif score < 60:
            # Medium score - room for improvement
            return f"""Just discovered my AI Visibility Score is {score}% 📊

When customers ask ChatGPT, Claude, and Gemini about "{category}", I'm only mentioned {int(mention_rate * 100)}% of the time.

Time to optimize for AI search. Check your score 👇
"""
        else:
            # Good score - humble brag
            return f"""Just checked my AI Visibility Score — {score}%! 🎉

{brand} is recommended by {int(mention_rate * 100)}% of AI models when people ask about "{category}".

Curious about your brand's AI visibility? Check free 👇
"""


# Singleton instance
speed_test_service = SpeedTestService()

