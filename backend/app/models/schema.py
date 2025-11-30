from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from enum import Enum

class SchemaType(str, Enum):
    PRODUCT = "product"
    ARTICLE = "article"
    FAQ = "faq"
    HOWTO = "howto"
    ORGANIZATION = "organization"
    LOCAL_BUSINESS = "localBusiness"
    BREADCRUMB = "breadcrumb"

class FAQItem(BaseModel):
    question: str
    answer: str

class SchemaRequest(BaseModel):
    schema_type: SchemaType
    data: Dict[str, Any]

class SchemaResponse(BaseModel):
    schema_type: SchemaType
    json_ld: str
    html_snippet: str
