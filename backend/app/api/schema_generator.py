from fastapi import APIRouter
from app.models.schema import SchemaRequest, SchemaResponse, SchemaType
import json

router = APIRouter()

@router.post("/generate", response_model=SchemaResponse)
async def generate_schema(request: SchemaRequest):
    """Generate schema markup based on user input"""

    schema = {}

    if request.schema_type == SchemaType.PRODUCT:
        schema = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": request.data.get("name", ""),
            "description": request.data.get("description", ""),
            "image": request.data.get("image", ""),
            "brand": {
                "@type": "Brand",
                "name": request.data.get("brand", "")
            },
            "offers": {
                "@type": "Offer",
                "price": request.data.get("price", "0"),
                "priceCurrency": request.data.get("currency", "EUR"),
                "availability": "https://schema.org/InStock"
            }
        }

        if request.data.get("rating"):
            schema["aggregateRating"] = {
                "@type": "AggregateRating",
                "ratingValue": request.data.get("rating"),
                "bestRating": "5",
                "worstRating": "1",
                "ratingCount": "1"
            }

    elif request.schema_type == SchemaType.ARTICLE:
        schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": request.data.get("title", ""),
            "description": request.data.get("description", ""),
            "image": request.data.get("image", ""),
            "author": {
                "@type": "Person",
                "name": request.data.get("author", "")
            },
            "datePublished": request.data.get("date", ""),
            "dateModified": request.data.get("date", "")
        }

    elif request.schema_type == SchemaType.FAQ:
        faqs = request.data.get("faqs", [])
        schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": faq.get("question", ""),
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq.get("answer", "")
                    }
                }
                for faq in faqs if faq.get("question") and faq.get("answer")
            ]
        }

    elif request.schema_type == SchemaType.HOWTO:
        schema = {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": request.data.get("title", ""),
            "description": request.data.get("description", ""),
            "image": request.data.get("image", ""),
            "step": []
        }

    elif request.schema_type == SchemaType.ORGANIZATION:
        schema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": request.data.get("name", ""),
            "url": request.data.get("url", ""),
            "logo": request.data.get("logo", "")
        }

    json_ld = json.dumps(schema, indent=2)
    html_snippet = f'<script type="application/ld+json">\n{json_ld}\n</script>'

    return SchemaResponse(
        schema_type=request.schema_type,
        json_ld=json_ld,
        html_snippet=html_snippet
    )
