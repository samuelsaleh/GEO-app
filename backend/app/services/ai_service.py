"""
Multi-Provider AI Service

Supports the BEST models from:
- Anthropic: Claude Opus 4 / Claude 3.5 Sonnet
- OpenAI: GPT-4o / GPT-4o-mini
- Google: Gemini 2.5 Pro / Gemini 2.5 Flash

Uses fallback system: tries providers in order until one succeeds.
"""

import json
import re
import logging
from typing import Optional, Dict, Any, List
from enum import Enum
from app.config import settings

logger = logging.getLogger(__name__)


class AIProvider(Enum):
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    GOOGLE = "google"


class AIModel:
    """Available AI models with their specs"""
    
    # Anthropic Models (Best for reasoning & analysis)
    CLAUDE_OPUS_4 = ("anthropic", "claude-sonnet-4-20250514", "Claude Sonnet 4")
    CLAUDE_SONNET_35 = ("anthropic", "claude-3-5-sonnet-20241022", "Claude 3.5 Sonnet")
    
    # OpenAI Models (Great all-around)
    GPT_4O = ("openai", "gpt-4o", "GPT-4o")
    GPT_4O_MINI = ("openai", "gpt-4o-mini", "GPT-4o Mini")
    
    # Google Models (Fast & cost-effective)
    GEMINI_PRO = ("google", "gemini-1.5-pro", "Gemini 1.5 Pro")
    GEMINI_FLASH = ("google", "gemini-1.5-flash", "Gemini 1.5 Flash")


class MultiProviderAI:
    """
    AI service that uses the best available model with fallbacks.
    
    Priority order (configurable):
    1. Anthropic Claude - Best for nuanced analysis
    2. OpenAI GPT-4o - Great all-around
    3. Google Gemini - Fast and reliable
    """
    
    def __init__(self):
        self.providers: Dict[str, Any] = {}
        self.provider_order: List[str] = []
        self._init_providers()
    
    def _init_providers(self):
        """Initialize all available AI providers"""
        
        # Parse provider priority from settings
        priority = settings.ai_provider_priority.split(",")
        self.provider_order = [p.strip().lower() for p in priority]
        
        # Initialize Anthropic (Claude)
        if settings.anthropic_api_key:
            try:
                from anthropic import Anthropic
                self.providers["anthropic"] = {
                    "client": Anthropic(api_key=settings.anthropic_api_key),
                    "model": "claude-sonnet-4-20250514",  # Best model
                    "fallback_model": "claude-3-5-sonnet-20241022",
                    "name": "Claude"
                }
                logger.info("✅ Anthropic (Claude) initialized")
            except Exception as e:
                logger.warning(f"❌ Failed to initialize Anthropic: {e}")
        
        # Initialize OpenAI (GPT-4)
        if settings.openai_api_key:
            try:
                from openai import OpenAI
                self.providers["openai"] = {
                    "client": OpenAI(api_key=settings.openai_api_key),
                    "model": "gpt-4o",  # Best model
                    "fallback_model": "gpt-4o-mini",
                    "name": "GPT-4o"
                }
                logger.info("✅ OpenAI (GPT-4o) initialized")
            except Exception as e:
                logger.warning(f"❌ Failed to initialize OpenAI: {e}")
        
        # Initialize Google (Gemini)
        if settings.google_api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.google_api_key)
                self.providers["google"] = {
                    "client": genai,
                    "model": "gemini-2.0-flash",  # Latest flash model
                    "fallback_model": "gemini-1.5-flash-latest",
                    "name": "Gemini"
                }
                logger.info("✅ Google (Gemini) initialized")
            except Exception as e:
                logger.warning(f"❌ Failed to initialize Google: {e}")
        
        if not self.providers:
            logger.warning("⚠️ No AI providers configured! Add API keys to .env")
        else:
            logger.info(f"🤖 AI providers available: {list(self.providers.keys())}")
    
    @property
    def is_available(self) -> bool:
        """Check if any AI provider is available"""
        return len(self.providers) > 0
    
    def get_available_providers(self) -> List[str]:
        """Get list of available providers"""
        return list(self.providers.keys())
    
    async def generate(
        self,
        prompt: str,
        system_prompt: str = "You are a helpful AI assistant.",
        max_tokens: int = 1000,
        temperature: float = 0.3,
        json_mode: bool = False
    ) -> Optional[str]:
        """
        Generate AI response using the best available provider.
        
        Tries providers in order of priority until one succeeds.
        
        Args:
            prompt: The user prompt
            system_prompt: System instructions
            max_tokens: Maximum response tokens
            temperature: Creativity (0-1)
            json_mode: If True, expects JSON response
        
        Returns:
            AI response text, or None if all providers fail
        """
        
        if not self.is_available:
            logger.error("No AI providers available")
            return None
        
        # Try providers in priority order
        for provider_name in self.provider_order:
            if provider_name not in self.providers:
                continue
            
            provider = self.providers[provider_name]
            
            try:
                logger.info(f"🤖 Trying {provider['name']}...")
                
                if provider_name == "anthropic":
                    result = await self._call_anthropic(
                        provider, prompt, system_prompt, max_tokens, temperature
                    )
                elif provider_name == "openai":
                    result = await self._call_openai(
                        provider, prompt, system_prompt, max_tokens, temperature, json_mode
                    )
                elif provider_name == "google":
                    result = await self._call_google(
                        provider, prompt, system_prompt, max_tokens, temperature
                    )
                else:
                    continue
                
                if result:
                    logger.info(f"✅ {provider['name']} responded successfully")
                    return result
                    
            except Exception as e:
                logger.warning(f"❌ {provider['name']} failed: {e}")
                continue
        
        logger.error("All AI providers failed")
        return None
    
    async def generate_with_model(
        self,
        prompt: str,
        system_prompt: str = "You are a helpful assistant.",
        model: str = "gpt-4o",
        provider: str = "openai",
        max_tokens: int = 1000,
        temperature: float = 0.3
    ) -> Optional[str]:
        """
        Generate response using a specific model.
        
        Args:
            prompt: The user prompt
            system_prompt: System instructions
            model: Specific model to use
            provider: Provider name (openai, anthropic, google)
            max_tokens: Max response length
            temperature: Creativity (0-1)
        """
        if provider not in self.providers:
            logger.warning(f"Provider {provider} not available")
            return None
        
        try:
            if provider == "anthropic":
                client = self.providers["anthropic"]["client"]
                response = client.messages.create(
                    model=model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    system=system_prompt,
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.content[0].text
                
            elif provider == "openai":
                client = self.providers["openai"]["client"]
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=max_tokens,
                    temperature=temperature
                )
                return response.choices[0].message.content
                
            elif provider == "google":
                genai = self.providers["google"]["client"]
                model_obj = genai.GenerativeModel(model)
                response = model_obj.generate_content(
                    f"{system_prompt}\n\n{prompt}",
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=max_tokens,
                        temperature=temperature
                    )
                )
                return response.text
                
        except Exception as e:
            logger.error(f"Error with {provider}/{model}: {e}")
            return None
        
        return None
    
    async def _call_anthropic(
        self,
        provider: Dict,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float
    ) -> Optional[str]:
        """Call Anthropic Claude API"""
        client = provider["client"]
        
        try:
            response = client.messages.create(
                model=provider["model"],
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        except Exception as e:
            # Try fallback model
            logger.warning(f"Primary model failed, trying fallback: {e}")
            try:
                response = client.messages.create(
                    model=provider["fallback_model"],
                    max_tokens=max_tokens,
                    temperature=temperature,
                    system=system_prompt,
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.content[0].text
            except:
                raise
    
    async def _call_openai(
        self,
        provider: Dict,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
        json_mode: bool = False
    ) -> Optional[str]:
        """Call OpenAI GPT API"""
        client = provider["client"]
        
        kwargs = {
            "model": provider["model"],
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
        }
        
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        
        try:
            response = client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
        except Exception as e:
            # Try fallback model
            logger.warning(f"Primary model failed, trying fallback: {e}")
            kwargs["model"] = provider["fallback_model"]
            try:
                response = client.chat.completions.create(**kwargs)
                return response.choices[0].message.content
            except:
                raise
    
    async def _call_google(
        self,
        provider: Dict,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float
    ) -> Optional[str]:
        """Call Google Gemini API"""
        genai = provider["client"]
        
        try:
            model = genai.GenerativeModel(
                model_name=provider["model"],
                system_instruction=system_prompt
            )
            
            response = model.generate_content(
                prompt,
                generation_config={
                    "max_output_tokens": max_tokens,
                    "temperature": temperature
                }
            )
            return response.text
        except Exception as e:
            # Try fallback model
            logger.warning(f"Primary model failed, trying fallback: {e}")
            try:
                model = genai.GenerativeModel(
                    model_name=provider["fallback_model"],
                    system_instruction=system_prompt
                )
                response = model.generate_content(
                    prompt,
                    generation_config={
                        "max_output_tokens": max_tokens,
                        "temperature": temperature
                    }
                )
                return response.text
            except:
                raise
    
    async def analyze_competitors(
        self,
        company_name: str,
        website_url: str,
        business_context: str,
        industry_keywords: Optional[List[str]] = None
    ) -> List[Dict[str, str]]:
        """
        Use AI to discover competitors.
        
        Returns list of competitor suggestions.
        """
        
        prompt = f"""Based on this business information, identify the top 3 direct competitors:

Company: {company_name}
Website: {website_url}
Business Context: {business_context}
{f"Industry Keywords: {', '.join(industry_keywords)}" if industry_keywords else ""}

Return ONLY a JSON array with exactly 3 competitors. Each should have:
- "name": company name
- "url": their main website URL (must be a real, valid URL)
- "reason": brief reason why they're a competitor

Example format:
[
  {{"name": "Competitor A", "url": "https://competitora.com", "reason": "Direct competitor in same market"}},
  {{"name": "Competitor B", "url": "https://competitorb.com", "reason": "Similar product offering"}},
  {{"name": "Competitor C", "url": "https://competitorc.com", "reason": "Targets same audience"}}
]

Return ONLY valid JSON, no other text or markdown."""

        system_prompt = """You are a competitive analysis expert. 
You identify real companies that are direct competitors based on business context.
Always return valid JSON only, no markdown code blocks."""

        response = await self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            max_tokens=500,
            temperature=0.3,
            json_mode=True
        )
        
        if not response:
            return []
        
        try:
            # Clean up response
            result = response.strip()
            if result.startswith("```"):
                result = re.sub(r'^```(?:json)?\n?', '', result)
                result = re.sub(r'\n?```$', '', result)
            
            competitors = json.loads(result)
            
            # Validate and format
            validated = []
            for comp in competitors[:3]:
                if comp.get("url") and comp.get("name"):
                    url = comp["url"]
                    if not url.startswith(("http://", "https://")):
                        url = f"https://{url}"
                    validated.append({
                        "name": comp["name"],
                        "url": url,
                        "reason": comp.get("reason", "Identified as competitor"),
                        "ai_discovered": True
                    })
            
            return validated
            
        except Exception as e:
            logger.error(f"Failed to parse competitor response: {e}")
            return []
    
    async def generate_insights(
        self,
        user_score: int,
        competitor_scores: List[Dict],
        user_strengths: List[str],
        user_weaknesses: List[str]
    ) -> Dict[str, Any]:
        """
        Generate AI-powered insights about competitive position.
        """
        
        prompt = f"""Analyze this competitive AI visibility comparison:

Your Client's Score: {user_score}/100

Competitors:
{json.dumps(competitor_scores, indent=2)}

Client Strengths: {', '.join(user_strengths)}
Client Weaknesses: {', '.join(user_weaknesses)}

Generate a brief, actionable analysis with:
1. "summary": One sentence summary of competitive position
2. "top_priority": The #1 thing to fix first
3. "quick_wins": List of 3 easy improvements
4. "competitive_advantage": What they're doing better than competitors

Return as JSON."""

        system_prompt = "You are a GEO (Generative Engine Optimization) expert. Give concise, actionable advice."
        
        response = await self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            max_tokens=500,
            temperature=0.5
        )
        
        if not response:
            return {}
        
        try:
            result = response.strip()
            if result.startswith("```"):
                result = re.sub(r'^```(?:json)?\n?', '', result)
                result = re.sub(r'\n?```$', '', result)
            return json.loads(result)
        except:
            return {"summary": response[:200]}


# Singleton instance
ai_service = MultiProviderAI()

