"""
Speed Test Service

The core engine for the AI Visibility Score feature.
Runs parallel AI queries across multiple models to test brand visibility.
Now with context-aware prompt generation.
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
    BrandContext, PROMPT_TEMPLATES, build_prompt_with_context,
    generate_questions_for_brand
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
    Now with smart, context-aware prompt generation.
    """
    
    # Best models from each provider (use short IDs for consistency with visibility_monitor)
    MODELS = [
        {"id": "gpt-4o", "provider": "openai", "name": "GPT-4o", "icon": "🤖"},
        {"id": "claude-sonnet-4", "provider": "anthropic", "name": "Claude Sonnet 4", "icon": "🧠"},
    ]
    
    # Map short IDs to actual API model names
    MODEL_ID_MAPPING = {
        "gpt-4o": "gpt-4o",
        "gpt-4o-mini": "gpt-4o-mini",
        "claude-sonnet-4": "claude-sonnet-4-20250514",
        "claude-3.5-sonnet": "claude-3-5-sonnet-20241022",
        "gemini-2.0-flash": "gemini-2.0-flash",
        "gemini-1.5-flash": "gemini-1.5-flash",
    }

    def __init__(self):
        self.ai_service = ai_service
    
    async def run_test(
        self,
        brand: str,
        category: str,
        location: Optional[str] = None,
        website_url: Optional[str] = None,
        brand_context: Optional[BrandContext] = None,
        custom_questions: Optional[List[str]] = None
    ) -> ScoreResponse:
        """
        Main entry point - runs complete visibility test.
        
        Args:
            brand: Brand name to test
            category: Product/service description (be specific!)
            location: Optional location for local businesses
            website_url: Optional website URL for context
            brand_context: Optional pre-analyzed brand context
            custom_questions: Optional custom questions to test
        
        Returns:
            ScoreResponse with complete test results
        """
        start_time = time.time()
        
        # 1. Build or use brand context
        if not brand_context:
            brand_context = BrandContext(
                brand_name=brand,
                website_url=website_url,
                product_category=category,
                location=location
            )
        
        # 2. Generate prompts (use custom questions if provided)
        if custom_questions:
            prompts = [
                {"text": q, "category": self._guess_prompt_category(q)}
                for q in custom_questions[:6]
            ]
        else:
            prompts = self._generate_prompts(brand_context)
        
        questions_tested = [p["text"] for p in prompts]
        logger.info(f"Generated {len(prompts)} prompts for {brand} in {category}")
        
        # 3. Run ALL queries in parallel
        all_results = await self._query_all_parallel(prompts, brand_context)
        
        # Filter out errors
        valid_results = [r for r in all_results if r and not r.error]
        logger.info(f"Got {len(valid_results)} valid results from {len(all_results)} queries")
        
        # 4. Calculate score and analyze results
        score, verdict, verdict_emoji, grade = self._calculate_score(valid_results)
        competitors = self._extract_competitors(valid_results, brand)
        prompt_results = self._group_by_prompt(prompts, all_results)
        model_breakdown = self._calculate_model_breakdown(all_results)
        worst_prompt = self._find_worst_prompt(prompt_results)
        killer_quote = self._extract_killer_quote(valid_results, brand, competitors)
        example_response = self._get_example_response(valid_results, brand)
        
        # 5. Calculate comparison with top competitor
        you_vs_top = None
        if competitors:
            top_comp = competitors[0]
            your_rate = int(len([r for r in valid_results if r.mentioned]) / len(valid_results) * 100) if valid_results else 0
            you_vs_top = {
                "competitor": top_comp.name,
                "their_rate": top_comp.rate,
                "your_rate": your_rate,
                "gap": top_comp.rate - your_rate
            }
        
        # 6. Generate share text
        mention_rate = len([r for r in valid_results if r.mentioned]) / len(valid_results) if valid_results else 0
        share_text = self._generate_share_text(brand, category, score, competitors, mention_rate)
        
        # 7. Build response
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
            test_duration_ms=test_duration_ms,
            questions_tested=questions_tested
        )
    
    def _guess_prompt_category(self, question: str) -> PromptCategory:
        """Guess the category of a question based on keywords"""
        q_lower = question.lower()
        
        if any(w in q_lower for w in ['vs', 'compare', 'versus', 'or', 'better']):
            return PromptCategory.COMPARISON
        elif any(w in q_lower for w in ['is', 'good', 'review', 'worth', 'should']):
            return PromptCategory.REPUTATION
        elif any(w in q_lower for w in ['buy', 'where', 'purchase', 'get', 'shop']):
            return PromptCategory.PURCHASE
        else:
            return PromptCategory.RECOMMENDATION
    
    def _generate_prompts(self, brand_context: BrandContext) -> List[Dict[str, Any]]:
        """Generate smart prompts based on brand context"""
        
        prompts = []
        category = brand_context.product_category
        brand = brand_context.brand_name
        
        # Recommendation prompts (most important)
        prompts.append({
            "text": f"What are the best {category}?",
            "category": PromptCategory.RECOMMENDATION
        })
        prompts.append({
            "text": f"Top {category} brands in 2025",
            "category": PromptCategory.RECOMMENDATION
        })
        
        # Reputation prompt
        prompts.append({
            "text": f"Is {brand} good for {category}? What are the alternatives?",
            "category": PromptCategory.REPUTATION
        })
        
        # Purchase prompt
        prompts.append({
            "text": f"Where should I buy {category}? What brands do you recommend?",
            "category": PromptCategory.PURCHASE
        })
        
        # Comparison prompt (if we have competitors)
        if brand_context.known_competitors:
            competitor = brand_context.known_competitors[0]
            prompts.append({
                "text": f"{brand} vs {competitor} - which is better for {category}?",
                "category": PromptCategory.COMPARISON
            })
        
        # Add location-specific prompt if provided
        if brand_context.location:
            prompts.append({
                "text": f"Best {category} in {brand_context.location}",
                "category": PromptCategory.RECOMMENDATION
            })
        
        return prompts[:4]  # Max 4 prompts for speed
    
    async def _query_all_parallel(
        self,
        prompts: List[Dict[str, Any]],
        brand_context: BrandContext
    ) -> List[ModelResult]:
        """Run ALL AI queries in parallel using asyncio.gather"""
        
        tasks = []
        
        for prompt in prompts:
            for model in self.MODELS:
                task = self._query_single_model(
                    prompt=prompt["text"],
                    prompt_category=prompt["category"],
                    model=model,
                    brand_context=brand_context
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
        brand_context: BrandContext
    ) -> ModelResult:
        """Query a single AI model with context-aware prompting"""
        
        start = time.time()
        response = ""
        error = None
        
        try:
            if not self.ai_service:
                raise Exception("AI service not available")
            
            # Check if the provider is available before calling
            provider = model["provider"]
            available_providers = self.ai_service.get_available_providers()
            if provider not in available_providers:
                error = f"Provider '{provider}' not configured. Add API key to .env file."
                logger.warning(f"Skipping {model['name']}: {error}")
                return ModelResult(
                    model_id=model["id"],
                    model_name=model["name"],
                    provider=model["provider"],
                    mentioned=False,
                    prompt=prompt,
                    error=error,
                    response_time_ms=int((time.time() - start) * 1000)
                )
            
            # Build context-aware system prompt
            template = PROMPT_TEMPLATES.get(prompt_category, PROMPT_TEMPLATES[PromptCategory.RECOMMENDATION])
            system_prompt = template["system_prompt"]
            
            # Add brand context to the prompt
            context_parts = []
            if brand_context.product_category:
                context_parts.append(f"Category: {brand_context.product_category}")
            if brand_context.brand_description:
                context_parts.append(f"About {brand_context.brand_name}: {brand_context.brand_description}")
            if brand_context.location:
                context_parts.append(f"Location: {brand_context.location}")
            
            context_str = "\n".join(context_parts) if context_parts else ""
            
            full_prompt = f"{prompt}"
            if context_str:
                full_prompt = f"Context:\n{context_str}\n\nQuestion: {prompt}"
            
            # Map short ID to actual API model name
            actual_model = self.MODEL_ID_MAPPING.get(model["id"], model["id"])
            
            response = await self.ai_service.generate_with_model(
                prompt=full_prompt,
                system_prompt=system_prompt,
                model=actual_model,
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
        brand = brand_context.brand_name
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
        
        # Match without spaces
        brand_no_space = brand_lower.replace(" ", "")
        response_no_space = response_lower.replace(" ", "")
        if brand_no_space in response_no_space:
            return True
        
        # Match with hyphen
        brand_hyphenated = brand_lower.replace(" ", "-")
        if brand_hyphenated in response_lower:
            return True
        
        return False
    
    def _find_position(self, brand: str, response: str) -> Optional[int]:
        """Find the position of the brand mention (1st, 2nd, 3rd, etc.)"""
        if not response:
            return None
        
        lines = response.split('\n')
        brand_lower = brand.lower()
        
        for i, line in enumerate(lines):
            line_lower = line.lower()
            
            if brand_lower in line_lower or brand_lower.replace(" ", "") in line_lower.replace(" ", ""):
                # Try to extract position from numbered list
                match = re.match(r'^[\s]*(\d+)[.\):\-]', line)
                if match:
                    return int(match.group(1))
                
                # Check for bullet points
                if line.strip().startswith(('-', '*', '•')):
                    bullet_count = 0
                    for j in range(i + 1):
                        if lines[j].strip().startswith(('-', '*', '•')):
                            bullet_count += 1
                    return bullet_count
        
        return None
    
    def _extract_brands_from_response(self, response: str, user_brand: str) -> List[str]:
        """Extract brand names mentioned in the response"""
        if not response:
            return []
        
        brands_found = []
        user_brand_lower = user_brand.lower()
        
        # Common brand patterns
        brand_patterns = [
            r'\*\*([A-Z][a-zA-Z\s&]+?)\*\*',  # **Brand Name**
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b',  # Capitalized words
            r'(?:\d+[.\)]\s*)([A-Z][a-zA-Z\s&]+)',  # In numbered lists
        ]
        
        # Skip words that aren't brands
        skip_words = {
            'the', 'and', 'for', 'with', 'this', 'that', 'these', 'those',
            'here', 'there', 'when', 'what', 'which', 'who', 'how', 'why',
            'best', 'top', 'great', 'good', 'nice', 'quality', 'price',
            'overall', 'however', 'although', 'because', 'since', 'while',
            'brand', 'brands', 'product', 'products', 'option', 'options',
            'choice', 'choices', 'alternative', 'alternatives', 'recommend',
            'known', 'popular', 'famous', 'leading', 'premier', 'luxury',
            'high', 'low', 'mid', 'range', 'end', 'tier', 'level',
            'why', 'pros', 'cons', 'features', 'benefits', 'quality'
        }
        
        for pattern in brand_patterns:
            matches = re.findall(pattern, response)
            for match in matches:
                brand = match.strip()
                brand_lower = brand.lower()
                
                # Skip common words
                if brand_lower in skip_words:
                    continue
                
                # Skip user's brand
                if brand_lower == user_brand_lower or user_brand_lower in brand_lower:
                    continue
                
                # Skip very short or very long
                if len(brand) < 3 or len(brand) > 30:
                    continue
                
                # Skip if contains numbers
                if re.search(r'\d', brand):
                    continue
                
                if brand not in brands_found:
                    brands_found.append(brand)
        
        return brands_found[:10]
    
    def _analyze_sentiment(self, response: str, brand: str) -> str:
        """Analyze sentiment of brand mention in response"""
        if not response:
            return "neutral"
        
        brand_lower = brand.lower()
        sentences = re.split(r'[.!?]', response)
        brand_sentences = [s for s in sentences if brand_lower in s.lower()]
        
        if not brand_sentences:
            return "neutral"
        
        text = ' '.join(brand_sentences).lower()
        
        positive_words = [
            'best', 'excellent', 'great', 'top', 'leading', 'recommend',
            'outstanding', 'innovative', 'quality', 'trusted', 'reliable',
            'popular', 'favorite', 'preferred', 'premium', 'loved'
        ]
        
        negative_words = [
            'bad', 'poor', 'avoid', 'problem', 'issue', 'complaint',
            'expensive', 'overpriced', 'disappointing', 'lacks', 'limited'
        ]
        
        positive_count = sum(1 for w in positive_words if w in text)
        negative_count = sum(1 for w in negative_words if w in text)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        return "neutral"
    
    def _extract_relevant_sentence(self, response: str, competitors: List[str]) -> Optional[str]:
        """Extract the most relevant sentence from response"""
        if not response:
            return None
        
        sentences = re.split(r'[.!?]', response)
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            has_recommendation = any(w in sentence_lower for w in ['recommend', 'suggest', 'best', 'top'])
            has_competitor = any(comp.lower() in sentence_lower for comp in competitors[:3])
            
            if has_recommendation and has_competitor:
                return sentence.strip() + "."
        
        for sentence in sentences:
            if any(comp.lower() in sentence.lower() for comp in competitors[:3]):
                return sentence.strip() + "."
        
        for sentence in sentences:
            if len(sentence.strip()) > 50:
                return sentence.strip() + "."
        
        return None
    
    def _calculate_score(self, results: List[ModelResult]) -> Tuple[int, str, str, str]:
        """Calculate visibility score with bonus factors"""
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
    
    def _extract_competitors(self, results: List[ModelResult], brand: str) -> List[CompetitorInfo]:
        """Find all competitors mentioned and rank by frequency"""
        competitor_counts: Dict[str, int] = {}
        brand_lower = brand.lower()
        
        for result in results:
            for comp in result.competitors_found:
                comp_lower = comp.lower()
                if comp_lower == brand_lower or brand_lower in comp_lower:
                    continue
                
                comp_normalized = comp.title()
                competitor_counts[comp_normalized] = competitor_counts.get(comp_normalized, 0) + 1
        
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
    
    def _group_by_prompt(self, prompts: List[Dict[str, Any]], results: List[ModelResult]) -> List[PromptResult]:
        """Group results by prompt"""
        prompt_results = []
        
        for prompt in prompts:
            prompt_text = prompt["text"]
            prompt_category = prompt["category"]
            
            matching_results = [r for r in results if r.prompt == prompt_text]
            
            mentions = sum(1 for r in matching_results if r.mentioned)
            total = len(matching_results)
            mention_rate = mentions / total if total > 0 else 0
            
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
        
        for result in results:
            if not result.mentioned and result.competitors_found:
                top_comp = result.competitors_found[0]
                return f'When asked "{result.prompt}", {result.model_name} recommended {top_comp}. You were not mentioned.'
        
        for result in results:
            if result.mentioned and result.position and result.position > 3:
                return f'When asked "{result.prompt}", {result.model_name} mentioned you at position #{result.position}.'
        
        return None
    
    def _get_example_response(self, results: List[ModelResult], brand: str) -> Optional[Dict[str, Any]]:
        """Get an example AI response to show the user"""
        
        for result in results:
            if not result.mentioned and result.full_response and not result.error:
                return {
                    "prompt": result.prompt,
                    "response": result.full_response[:500] + "..." if len(result.full_response) > 500 else result.full_response,
                    "model": result.model_name,
                    "mentioned": False
                }
        
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
            top_comp = competitors[0].name if competitors else "competitors"
            return f"""I just checked my AI Visibility Score — only {score}%! 😱

When people ask AI for "{category}", {top_comp} shows up but {brand} doesn't.

{int(mention_rate * 100)}% of AI models recommend my competitors over me.

Check your brand's AI visibility for free 👇
"""
        elif score < 60:
            return f"""Just discovered my AI Visibility Score is {score}% 📊

When customers ask ChatGPT, Claude, and Gemini about "{category}", I'm only mentioned {int(mention_rate * 100)}% of the time.

Time to optimize for AI search. Check your score 👇
"""
        else:
            return f"""Just checked my AI Visibility Score — {score}%! 🎉

{brand} is recommended by {int(mention_rate * 100)}% of AI models when people ask about "{category}".

Curious about your brand's AI visibility? Check free 👇
"""


# Singleton instance
speed_test_service = SpeedTestService()
