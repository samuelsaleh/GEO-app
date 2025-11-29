"""
Stripe Payment Service

Handles payment processing for:
- €97 Competitive Test
- €2,400 Full Audit
"""

import os
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# Try to import stripe, but don't fail if not installed
try:
    import stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False
    logger.warning("Stripe not installed. Payment features disabled.")


class StripeService:
    """Handle Stripe payments for Creed products"""
    
    # Product prices in cents (EUR)
    PRODUCTS = {
        "competitive_test": {
            "name": "Competitive Visibility Test",
            "amount": 9700,  # €97.00
            "currency": "eur",
            "description": "Full competitive visibility test across 6 AI models with 10 competitors"
        },
        "full_audit": {
            "name": "Full AI Visibility Audit",
            "amount": 240000,  # €2,400.00
            "currency": "eur",
            "description": "Complete audit with implementation roadmap and strategy call"
        },
        "monitoring_3mo": {
            "name": "3-Month Visibility Monitoring",
            "amount": 267000,  # €2,670 (€890/mo)
            "currency": "eur",
            "description": "3 months of weekly visibility tracking"
        },
        "monitoring_12mo": {
            "name": "12-Month Visibility Monitoring",
            "amount": 800000,  # €8,000 (€667/mo)
            "currency": "eur",
            "description": "12 months of weekly visibility tracking with priority support"
        }
    }
    
    def __init__(self):
        self.available = STRIPE_AVAILABLE and bool(os.getenv("STRIPE_SECRET_KEY"))
        if not self.available:
            logger.warning("Stripe service not configured. Set STRIPE_SECRET_KEY in .env")
    
    def get_product(self, product_id: str) -> Optional[Dict]:
        """Get product details by ID"""
        return self.PRODUCTS.get(product_id)
    
    def create_payment_intent(
        self,
        product_id: str,
        email: str,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Create a Stripe payment intent for a product.
        
        Args:
            product_id: One of the PRODUCTS keys
            email: Customer email for receipt
            metadata: Additional data to store with payment
            
        Returns:
            Dict with client_secret and payment_intent_id
        """
        if not self.available:
            raise Exception("Stripe is not configured")
        
        product = self.get_product(product_id)
        if not product:
            raise ValueError(f"Unknown product: {product_id}")
        
        try:
            intent = stripe.PaymentIntent.create(
                amount=product["amount"],
                currency=product["currency"],
                receipt_email=email,
                description=product["description"],
                metadata={
                    "product_id": product_id,
                    "product_name": product["name"],
                    "email": email,
                    **(metadata or {})
                }
            )
            
            logger.info(f"Created payment intent {intent.id} for {product_id}")
            
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id,
                "amount": product["amount"],
                "currency": product["currency"]
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating payment intent: {e}")
            raise
    
    def verify_payment(self, payment_intent_id: str) -> Dict:
        """
        Verify a payment was successful.
        
        Args:
            payment_intent_id: The payment intent ID to verify
            
        Returns:
            Dict with success status and payment details
        """
        if not self.available:
            raise Exception("Stripe is not configured")
        
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                "success": intent.status == "succeeded",
                "status": intent.status,
                "amount": intent.amount,
                "currency": intent.currency,
                "email": intent.receipt_email,
                "metadata": intent.metadata
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error verifying payment: {e}")
            return {
                "success": False,
                "status": "error",
                "error": str(e)
            }
    
    def create_checkout_session(
        self,
        product_id: str,
        success_url: str,
        cancel_url: str,
        email: str,
        metadata: Optional[Dict] = None
    ) -> str:
        """
        Create a Stripe Checkout session (hosted payment page).
        
        Args:
            product_id: Product to purchase
            success_url: URL to redirect on success
            cancel_url: URL to redirect on cancel
            email: Customer email
            metadata: Additional data
            
        Returns:
            Checkout session URL
        """
        if not self.available:
            raise Exception("Stripe is not configured")
        
        product = self.get_product(product_id)
        if not product:
            raise ValueError(f"Unknown product: {product_id}")
        
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": product["currency"],
                        "unit_amount": product["amount"],
                        "product_data": {
                            "name": product["name"],
                            "description": product["description"]
                        }
                    },
                    "quantity": 1
                }],
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=email,
                metadata={
                    "product_id": product_id,
                    **(metadata or {})
                }
            )
            
            logger.info(f"Created checkout session {session.id} for {product_id}")
            return session.url
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating checkout session: {e}")
            raise
    
    def get_products_list(self) -> Dict:
        """Get all available products with pricing"""
        return {
            product_id: {
                **product,
                "price_display": f"€{product['amount'] / 100:,.0f}"
            }
            for product_id, product in self.PRODUCTS.items()
        }


# Singleton instance
stripe_service = StripeService()

