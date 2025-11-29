"""
Prompt Generator Service
Generates neutral, strategic prompts for competitive visibility testing
"""

from typing import List, Dict
from enum import Enum


class PromptCategory(str, Enum):
    """Categories of prompts for different user intents"""
    RECOMMENDATION = "recommendation"  # "What should I use?"
    COMPARISON = "comparison"          # "What are my options?"
    PROBLEM = "problem"                # "How do I solve X?"
    REVIEW = "review"                  # "What are pros/cons?"


class PromptGenerator:
    """Generates strategic prompts for competitive testing"""

    def __init__(self):
        # Template patterns for each category
        self.templates = {
            PromptCategory.RECOMMENDATION: [
                "What {category} should I use for {use_case}?",
                "What's the best {category} for {use_case}?",
                "Which {category} do you recommend for {use_case}?",
                "What {category} would you suggest for {use_case}?",
            ],
            PromptCategory.COMPARISON: [
                "What are the top {category} options for {use_case}?",
                "What are the best {category} platforms available?",
                "Compare different {category} solutions for {use_case}",
                "What {category} options should I consider?",
            ],
            PromptCategory.PROBLEM: [
                "How do I {problem} for my {business_type}?",
                "What's the best way to {problem}?",
                "I need to {problem} - what should I use?",
                "Help me {problem} efficiently",
            ],
            PromptCategory.REVIEW: [
                "What are the pros and cons of different {category}?",
                "What should I know before choosing a {category}?",
                "What are common issues with {category} tools?",
                "What do people complain about with {category}?",
            ]
        }

        # Use case variations by category
        self.use_cases = {
            "CRM": ["small business", "sales team", "startup", "enterprise"],
            "project management": ["remote team", "startup", "agency", "development team"],
            "marketing automation": ["small business", "e-commerce", "SaaS company"],
            "accounting": ["freelancer", "small business", "startup"],
            "help desk": ["startup", "SaaS company", "support team"],
            "email marketing": ["e-commerce", "newsletter", "small business"],
        }

        # Problem statements by category
        self.problems = {
            "CRM": ["manage customer relationships", "track sales pipeline", "organize contacts"],
            "project management": ["manage projects", "track team tasks", "collaborate remotely"],
            "marketing automation": ["automate email campaigns", "nurture leads", "track marketing ROI"],
        }

    def generate_prompts(
        self,
        category: str,
        num_prompts: int = 3,
        include_categories: List[PromptCategory] = None
    ) -> List[Dict[str, str]]:
        """
        Generate strategic prompts for a category

        Args:
            category: The product category (e.g., "CRM", "project management")
            num_prompts: Number of prompts to generate (default 3 for free, 10 for paid)
            include_categories: Which prompt categories to include

        Returns:
            List of dicts with 'prompt' and 'category' keys
        """
        if include_categories is None:
            # Default: mix of recommendation and comparison for free tier
            include_categories = [PromptCategory.RECOMMENDATION, PromptCategory.COMPARISON]

        prompts = []
        category_lower = category.lower()

        # Get use cases for this category (or use generic)
        use_cases = self.use_cases.get(category_lower, ["my business", "my team", "our company"])
        problems = self.problems.get(category_lower, ["improve efficiency", "solve this problem"])

        # Generate prompts for each category
        for prompt_category in include_categories:
            templates = self.templates[prompt_category]

            for i, template in enumerate(templates):
                if len(prompts) >= num_prompts:
                    break

                # Fill in template
                if prompt_category == PromptCategory.PROBLEM:
                    prompt_text = template.format(
                        problem=problems[i % len(problems)],
                        business_type="business"
                    )
                else:
                    prompt_text = template.format(
                        category=category_lower,
                        use_case=use_cases[i % len(use_cases)]
                    )

                prompts.append({
                    "prompt": prompt_text,
                    "category": prompt_category.value,
                    "intent": self._get_intent_description(prompt_category)
                })

            if len(prompts) >= num_prompts:
                break

        return prompts[:num_prompts]

    def _get_intent_description(self, category: PromptCategory) -> str:
        """Get human-readable description of prompt intent"""
        descriptions = {
            PromptCategory.RECOMMENDATION: "Direct recommendation queries",
            PromptCategory.COMPARISON: "Comparison and research queries",
            PromptCategory.PROBLEM: "Problem-solving queries",
            PromptCategory.REVIEW: "Review and evaluation queries"
        }
        return descriptions.get(category, "General queries")

    def generate_free_tier_prompts(self, category: str) -> List[Dict[str, str]]:
        """Generate 3 prompts for free tier (recommendation + comparison only)"""
        return self.generate_prompts(
            category=category,
            num_prompts=3,
            include_categories=[PromptCategory.RECOMMENDATION, PromptCategory.COMPARISON]
        )

    def generate_paid_tier_prompts(self, category: str) -> List[Dict[str, str]]:
        """Generate 10 prompts for paid tier (all categories)"""
        return self.generate_prompts(
            category=category,
            num_prompts=10,
            include_categories=[
                PromptCategory.RECOMMENDATION,
                PromptCategory.COMPARISON,
                PromptCategory.PROBLEM,
                PromptCategory.REVIEW
            ]
        )


# Singleton instance
prompt_generator = PromptGenerator()
