"""
Multi-Provider AI Service

Supports the BEST models from:
- Anthropic: Claude Opus 4 / Claude 3.5 Sonnet
- OpenAI: GPT-5.1 / GPT-5.1-mini
- Google: Gemini 2.5 Pro / Gemini 2.5 Flash

Uses fallback system: tries providers in order until one succeeds.
"""

import json
import re
import logging
from typing import Optional, Dict, Any, List
from enum import Enum
from app.config import settings

# Try new Google GenAI import
try:
    from google import genai
except ImportError:
    genai = None

logger = logging.getLogger(__name__)


class AIProvider(Enum):
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    GOOGLE = "google"
    PERPLEXITY = "perplexity"


class AIModel:
    """Available AI models with their specs"""
    
    # Anthropic Models (Best for reasoning & analysis)
    CLAUDE_OPUS_4 = ("anthropic", "claude-sonnet-4-20250514", "Claude Sonnet 4")
    CLAUDE_SONNET_35 = ("anthropic", "claude-3-5-sonnet-20241022", "Claude 3.5 Sonnet")
    
    # OpenAI Models (Great all-around)
    GPT_5_1 = ("openai", "gpt-5.1", "GPT-5.1")
    GPT_5_1_MINI = ("openai", "gpt-5.1-mini", "GPT-5.1 Mini")
    
    # Google Models (Fast & cost-effective)
    GEMINI_3_PRO = ("google", "gemini-2.0-flash-exp", "Gemini 3 Pro") # Using 2.0 flash exp as placeholder for 3 pro preview based on user snippet implying 3 pro availability or preview
    # Wait, user said "gemini-3-pro-preview".
    GEMINI_3_PRO_PREVIEW = ("google", "gemini-3-pro-preview", "Gemini 3 Pro Preview")
    GEMINI_PRO = ("google", "gemini-1.5-pro", "Gemini 1.5 Pro")
    GEMINI_FLASH = ("google", "gemini-1.5-flash", "Gemini 1.5 Flash")

    # Perplexity Models (Best for real-time search)
    PERPLEXITY_SONAR = ("perplexity", "sonar", "Perplexity Sonar")
    PERPLEXITY_SONAR_PRO = ("perplexity", "sonar-pro", "Perplexity Sonar Pro")


class MultiProviderAI:
    """
    AI service that uses the best available model with fallbacks.
    
    Priority order (configurable):
    1. Anthropic Claude - Best for nuanced analysis
    2. OpenAI GPT-5.1 - Great all-around
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
                    "model": "claude-sonnet-4-20250514",  # Latest Claude Sonnet 4
                    "fallback_model": "claude-3-5-sonnet-20241022",  # Fallback to 3.5 Sonnet
                    "name": "Claude"
                }
                logger.info("✅ Anthropic (Claude) initialized")
            except Exception as e:
                logger.warning(f"❌ Failed to initialize Anthropic: {e}")
        
        # Initialize OpenAI (GPT-5.1)
        if settings.openai_api_key:
            try:
                from openai import OpenAI
                self.providers["openai"] = {
                    "client": OpenAI(api_key=settings.openai_api_key),
                    "model": "gpt-5.1",  # Latest GPT-5.1 model
                    "fallback_model": "gpt-5.1-mini",  # Faster, cheaper variant
                    "name": "GPT-5.1"
                }
                logger.info("✅ OpenAI (GPT-5.1) initialized")
            except Exception as e:
                logger.warning(f"❌ Failed to initialize OpenAI: {e}")
        
        # Initialize Google (Gemini)
        if settings.google_api_key and genai:
            try:
                # New Google GenAI SDK
                self.providers["google"] = {
                    "client": genai.Client(api_key=settings.google_api_key),
                    "model": "gemini-3-pro-preview",  # Latest Gemini 3 Pro
                    "fallback_model": "gemini-2.0-flash-exp",  # Fallback
                    "name": "Gemini 3 Pro"
                }
                logger.info("✅ Google (Gemini 3 Pro) initialized")
            except Exception as e:
                logger.warning(f"❌ Failed to initialize Google: {e}")
        elif settings.google_api_key:
             # Fallback to old SDK if new one not available (shouldn't happen with requirements update)
            try:
                import google.generativeai as old_genai
                old_genai.configure(api_key=settings.google_api_key)
                self.providers["google"] = {
                    "client": old_genai,
                    "model": "gemini-1.5-pro",
                    "fallback_model": "gemini-1.5-flash",
                    "name": "Gemini 1.5 (Legacy)"
                }
                logger.info("✅ Google (Gemini 1.5 Legacy) initialized")
            except Exception as e:
                logger.warning(f"❌ Failed to initialize Google (Legacy): {e}")
        
        # Initialize Perplexity (Search)
        if hasattr(settings, 'perplexity_api_key') and settings.perplexity_api_key:
            try:
                from openai import OpenAI
                self.providers["perplexity"] = {
                    "client": OpenAI(api_key=settings.perplexity_api_key, base_url="https://api.perplexity.ai"),
                    "model": "sonar", 
                    "fallback_model": "sonar-pro",
                    "name": "Perplexity"
                }
                logger.info("✅ Perplexity initialized")
            except Exception as e:
                logger.warning(f"❌ Failed to initialize Perplexity: {e}")

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
        json_mode: bool = False,
        web_search: bool = False
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
            web_search: If True, enables web search (OpenAI only currently)
        
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
                        provider, prompt, system_prompt, max_tokens, temperature, json_mode, web_search
                    )
                elif provider_name == "google":
                    result = await self._call_google(
                        provider, prompt, system_prompt, max_tokens, temperature, web_search=web_search
                    )
                elif provider_name == "perplexity":
                    result = await self._call_openai(
                        provider, prompt, system_prompt, max_tokens, temperature, json_mode
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
        model: str = "gpt-5.1",
        provider: str = "openai",
        max_tokens: int = 1000,
        temperature: float = 0.3,
        web_search: bool = False
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
            web_search: Enable web search
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
                return await self._call_openai(
                    self.providers["openai"], 
                    prompt, 
                    system_prompt, 
                    max_tokens, 
                    temperature, 
                    web_search=web_search
                )
                
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

            elif provider == "perplexity":
                client = self.providers["perplexity"]["client"]
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
        json_mode: bool = False,
        web_search: bool = False
    ) -> Optional[str]:
        """Call OpenAI GPT API"""
        client = provider["client"]
        
        if web_search:
            try:
                # Use Responses API for web search if possible
                # Based on user documentation:
                # response = await client.responses.create(...)
                # Note: 'responses' might be a new attribute on client
                
                # Check if client has responses attribute (new SDK)
                if hasattr(client, 'responses'):
                    logger.info("🌐 Using OpenAI Responses API for Web Search")
                    response = client.responses.create(
                        model="gpt-5", # Use generic gpt-5 for web search
                        tools=[{"type": "web_search"}],
                        input=prompt
                    )
                    
                    if hasattr(response, 'output_text'):
                        return response.output_text
                    else:
                        # Fallback for unexpected response structure
                        # The user docs show response.output_text
                        logger.warning(f"Response object missing output_text, returning str representation: {response}")
                        return str(response)
                
                # Fallback to chat completions if responses not available or specialized model
                # Some docs suggest 'gpt-4o-search-preview' might work with standard chat completions
                logger.info("🌐 Using Chat Completions for Web Search (Fallback)")
                kwargs = {
                    "model": "gpt-4o-search-preview", # Try specialized search model
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ]
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}
                    
                response = client.chat.completions.create(**kwargs)
                return response.choices[0].message.content
                
            except Exception as e:
                logger.error(f"Web search failed: {e}. Falling back to standard generation.")
                # Fallback to standard flow below
        
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
        temperature: float,
        web_search: bool = False
    ) -> Optional[str]:
        """Call Google Gemini API"""
        client = provider["client"]
        
        # Check if using new SDK (client is instance of genai.Client)
        is_new_sdk = False
        if genai and isinstance(client, genai.Client):
            is_new_sdk = True
            
        if is_new_sdk:
            try:
                # Setup tools for web search if requested
                tools = [{"google_search": {}}] if web_search else None
                
                response = client.models.generate_content(
                    model=provider["model"],
                    contents=f"{system_prompt}\n\n{prompt}",
                    config=genai.types.GenerateContentConfig(
                        max_output_tokens=max_tokens,
                        temperature=temperature,
                        tools=tools
                    )
                )
                return response.text
            except Exception as e:
                logger.warning(f"Google (New SDK) failed: {e}")
                # Try fallback model
                if provider.get("fallback_model"):
                    try:
                        tools = [{"google_search": {}}] if web_search else None
                        response = client.models.generate_content(
                            model=provider["fallback_model"],
                            contents=f"{system_prompt}\n\n{prompt}",
                            config=genai.types.GenerateContentConfig(
                                max_output_tokens=max_tokens,
                                temperature=temperature,
                                tools=tools
                            )
                        )
                        return response.text
                    except:
                        pass
                raise e

        # Old SDK (Legacy)
        # Does not support the same web_search interface easily here, ignoring web_search for legacy
        try:
            model = client.GenerativeModel(
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
                model = client.GenerativeModel(
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
Always return valid JSON only, no markdown code blocks.
Use web search to verify these competitors exist and are relevant."""

        # Enable web search for better competitor discovery
        response = await self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            max_tokens=500,
            temperature=0.3,
            json_mode=True,
            web_search=True
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

    async def generate_search_questions(
        self,
        brand: str,
        industry: str,
        competitors: List[str] = [],
        count: int = 5
    ) -> List[Dict[str, str]]:
        """
        Generate search questions that potential customers might ask.
        
        These questions are used to test if the brand appears in AI answers.
        Includes a mix of:
        - Broad category searches ("Best CRM software")
        - Specific feature searches ("Time tracking with invoicing")
        - Competitor alternatives ("Alternatives to Toggl")
        """
        
        comp_str = ", ".join(competitors) if competitors else "major competitors"
        
        prompt = f"""Generate {count} distinct search queries that a potential customer would use to find products/services in the {industry} industry.

Brand Context:
- Brand: {brand}
- Industry: {industry}
- Competitors: {comp_str}

Create queries in these specific categories:
1. "commercial": High intent searches (e.g. "Best {industry} software 2024")
2. "informational": Learning about solutions (e.g. "How to solve [problem]")
3. "comparative": Comparing options (e.g. "{brand} vs [Competitor]")
4. "transactional": Ready to buy (e.g. "Cheap {industry} for startups")

Return ONLY a JSON array of objects with:
- "query": The search query string
- "intent": The category (commercial, informational, comparative, transactional)
- "rationale": Brief reason why this is a good test query

Example:
[
  {{"query": "Best time tracking apps for freelancers", "intent": "commercial", "rationale": "High volume search term"}},
  {{"query": "Toggl vs Kimai comparison", "intent": "comparative", "rationale": "Direct brand comparison"}}
]
"""

        system_prompt = "You are an SEO and Search Intent expert. Generate realistic user queries."
        
        response = await self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            max_tokens=800,
            temperature=0.7,
            json_mode=True
        )
        
        if not response:
            return []
            
        try:
            result = response.strip()
            # Handle potential markdown fencing
            if result.startswith("```"):
                result = re.sub(r'^```(?:json)?\n?', '', result)
                result = re.sub(r'\n?```$', '', result)
                
            questions = json.loads(result)
            return questions[:count]
        except Exception as e:
            logger.error(f"Failed to parse search questions: {e}")
            return []

    async def analyze_search_result(
        self,
        query: str,
        response_text: str,
        brand: str,
        competitors: List[str] = [],
        web_search: bool = False
    ) -> Dict[str, Any]:
        """
        Analyze an AI response to see if/how a brand was mentioned.
        
        Uses an LLM to "grade" the response, which is more accurate than regex.
        """
        comp_str = ", ".join(competitors)
        
        prompt = f"""Analyze this AI search result.
        
User Query: "{query}"
AI Response: "{response_text}"

Brand to Track: "{brand}"
Competitors: "{comp_str}"

Determine:
1. Is "{brand}" mentioned? (true/false)
2. What is the sentiment? (positive/neutral/negative)
3. If it's a list/ranking, what position is it? (1 = first, null if not in list)
4. Are any competitors mentioned? (list of names)
5. How is the brand presented? (recommendation, comparison, passing mention, etc.)

Return ONLY JSON:
{{
  "mentioned": boolean,
  "sentiment": "positive"|"neutral"|"negative",
  "position": number|null,
  "competitors_found": string[],
  "context": string
}}
"""
        system_prompt = "You are an AI Analyst. Be precise. Return valid JSON only."

        response = await self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            max_tokens=300,
            temperature=0,
            json_mode=True,
            web_search=web_search
        )
        
        if not response:
            return {"mentioned": False, "sentiment": "neutral", "position": None, "competitors_found": [], "context": "analysis_failed"}
            
        try:
            result = response.strip()
            if result.startswith("```"):
                result = re.sub(r'^```(?:json)?\n?', '', result)
                result = re.sub(r'\n?```$', '', result)
            return json.loads(result)
        except Exception as e:
            logger.error(f"Failed to parse analysis result: {e}")
            return {"mentioned": False, "sentiment": "neutral", "position": None, "competitors_found": [], "context": "parse_error"}




# Singleton instance
ai_service = MultiProviderAI()
