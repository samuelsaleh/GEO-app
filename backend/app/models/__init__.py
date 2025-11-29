"""
Models package

Contains Pydantic models for API requests and responses.
"""

from app.models.speed_test import (
    ScoreRequest,
    ScoreResponse,
    ModelResult,
    PromptResult,
    CompetitorInfo,
    ModelBreakdown,
    PromptCategory,
    get_category_config,
    CATEGORY_CONFIG,
)

__all__ = [
    "ScoreRequest",
    "ScoreResponse",
    "ModelResult",
    "PromptResult",
    "CompetitorInfo",
    "ModelBreakdown",
    "PromptCategory",
    "get_category_config",
    "CATEGORY_CONFIG",
]

