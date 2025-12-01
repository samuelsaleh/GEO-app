'use client'

import { useState, useEffect } from 'react'
import { Copy, CheckCircle, Code, ArrowLeft, Plus, Trash2, RefreshCw, Sparkles, Lock } from 'lucide-react'
import Link from 'next/link'

type SchemaType = 'product' | 'article' | 'faq' | 'howto' | 'organization' | 'localBusiness' | 'breadcrumb'

export default function SchemaGenerator() {
  const [schemaType, setSchemaType] = useState<SchemaType>('product')
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)

  // Product fields
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productCurrency, setProductCurrency] = useState('EUR')
  const [productImage, setProductImage] = useState('')
  const [productBrand, setProductBrand] = useState('')
  const [productRating, setProductRating] = useState('')

  // Article fields
  const [articleTitle, setArticleTitle] = useState('')
  const [articleDescription, setArticleDescription] = useState('')
  const [articleAuthor, setArticleAuthor] = useState('')
  const [articleDate, setArticleDate] = useState('')
  const [articleImage, setArticleImage] = useState('')

  // FAQ fields
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }])

  // HowTo fields
  const [howtoTitle, setHowtoTitle] = useState('')
  const [howtoDescription, setHowtoDescription] = useState('')
  const [howtoSteps, setHowtoSteps] = useState([{ name: '', text: '', image: '', url: '' }])

  // Local Business fields
  const [businessName, setBusinessName] = useState('')
  const [businessImage, setBusinessImage] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [businessCity, setBusinessCity] = useState('')
  const [businessZip, setBusinessZip] = useState('')
  const [businessCountry, setBusinessCountry] = useState('')
  const [businessPriceRange, setBusinessPriceRange] = useState('$$')

  // Breadcrumb fields
  const [breadcrumbs, setBreadcrumbs] = useState([{ name: 'Home', item: 'https://example.com' }])

  // FAQ Handlers
  const addFAQ = () => setFaqs([...faqs, { question: '', answer: '' }])
  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs]
    newFaqs[index][field] = value
    setFaqs(newFaqs)
  }
  const removeFAQ = (index: number) => setFaqs(faqs.filter((_, i) => i !== index))

  // HowTo Handlers
  const addStep = () => setHowtoSteps([...howtoSteps, { name: '', text: '', image: '', url: '' }])
  const updateStep = (index: number, field: keyof typeof howtoSteps[0], value: string) => {
    const newSteps = [...howtoSteps]
    newSteps[index][field] = value
    setHowtoSteps(newSteps)
  }
  const removeStep = (index: number) => setHowtoSteps(howtoSteps.filter((_, i) => i !== index))

  // Breadcrumb Handlers
  const addBreadcrumb = () => setBreadcrumbs([...breadcrumbs, { name: '', item: '' }])
  const updateBreadcrumb = (index: number, field: 'name' | 'item', value: string) => {
    const newCrumbs = [...breadcrumbs]
    newCrumbs[index][field] = value
    setBreadcrumbs(newCrumbs)
  }
  const removeBreadcrumb = (index: number) => setBreadcrumbs(breadcrumbs.filter((_, i) => i !== index))

  const generateSchema = () => {
    let schema: any = {}

    switch (schemaType) {
      case 'product':
        schema = {
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": productName || "Product Name",
          "description": productDescription || "Product Description",
          "image": productImage ? [productImage] : [],
          "brand": {
            "@type": "Brand",
            "name": productBrand || "Brand Name"
          },
          "offers": {
            "@type": "Offer",
            "price": productPrice,
            "priceCurrency": productCurrency,
            "availability": "https://schema.org/InStock"
          }
        }
        if (productRating) {
          schema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": productRating,
            "reviewCount": "10" // Default for validity
          }
        }
        break

      case 'article':
        schema = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": articleTitle || "Article Headline",
          "description": articleDescription,
          "image": articleImage ? [articleImage] : [],
          "author": {
            "@type": "Person",
            "name": articleAuthor || "Author Name"
          },
          "datePublished": articleDate || new Date().toISOString(),
          "dateModified": articleDate || new Date().toISOString()
        }
        break

      case 'faq':
        schema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.filter(faq => faq.question && faq.answer).map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }
        break

      case 'howto':
        schema = {
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": howtoTitle || "How-To Title",
          "description": howtoDescription,
          "step": howtoSteps.filter(s => s.name || s.text).map(step => ({
            "@type": "HowToStep",
            "name": step.name,
            "text": step.text,
            "image": step.image,
            "url": step.url
          }))
        }
        break

      case 'organization':
        schema = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": productBrand || "Organization Name", // Reusing productBrand for Org Name simplicity
          "url": productImage || "https://example.com", // Reusing productImage for URL
          "logo": productImage || "https://example.com/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-000-000-0000",
            "contactType": "customer service"
          }
        }
        break

      case 'localBusiness':
        schema = {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": businessName || "Business Name",
          "image": businessImage,
          "telephone": businessPhone,
          "priceRange": businessPriceRange,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": businessAddress,
            "addressLocality": businessCity,
            "postalCode": businessZip,
            "addressCountry": businessCountry
          }
        }
        break

      case 'breadcrumb':
        schema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.item
          }))
        }
        break
    }

    const code = `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`
    setGeneratedCode(code)
  }

  // Live generation
  useEffect(() => {
    generateSchema()
  }, [
    schemaType,
    productName, productDescription, productPrice, productCurrency, productImage, productBrand, productRating,
    articleTitle, articleDescription, articleAuthor, articleDate, articleImage,
    faqs,
    howtoTitle, howtoDescription, howtoSteps,
    businessName, businessImage, businessPhone, businessAddress, businessCity, businessZip, businessCountry, businessPriceRange,
    breadcrumbs
  ])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen hero-gradient relative">
      <div className="bg-grain" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/tools" className="flex items-center gap-3 text-ink hover:text-claude-500 transition-colors group">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-ink/5 group-hover:border-claude-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-display text-xl font-bold">
                Miageru
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-enter">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/60 backdrop-blur-sm mb-6">
            <Code className="w-4 h-4 text-claude-500" />
            <span className="text-sm font-medium text-ink-light uppercase tracking-wider">JSON-LD Builder</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ink tracking-tight">Schema Generator</h1>
          <p className="text-lg text-ink-light max-w-2xl mx-auto leading-relaxed">
            Instantly generate semantic markup to help AI understand your content.
          </p>
        </div>

        <div className="relative">
          {/* Locked Overlay */}
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/50 rounded-[2rem] border border-white/20">
            <div className="glass-card p-8 rounded-2xl text-center shadow-2xl max-w-md mx-4 animate-enter border border-ink/5">
              <div className="w-16 h-16 bg-ink/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-ink-muted" />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-4">Coming Soon</h2>
              <p className="text-ink-light mb-8">
                We're putting the finishing touches on the Schema Generator. Check back soon or join our waitlist for updates.
              </p>
              <Link href="/contact" className="btn-primary inline-flex items-center justify-center w-full">
                Contact Sales for Early Access
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 opacity-50 pointer-events-none select-none blur-sm">
            {/* Form Section */}
            <div className="glass-card p-8 overflow-y-auto max-h-[800px] rounded-[2rem] animate-enter delay-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-ink">Configuration</h2>
                <div className="text-xs font-bold text-claude-600 uppercase tracking-widest bg-claude-50 px-3 py-1 rounded-full flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin-slow" />
                  Auto-Updating
                </div>
              </div>

              {/* Schema Type Selector */}
              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-ink-muted">Schema Type</label>
                <select
                  value={schemaType}
                  onChange={(e) => setSchemaType(e.target.value as SchemaType)}
                  className="w-full px-5 py-4"
                >
                  <option value="product">Product</option>
                  <option value="article">Article</option>
                  <option value="faq">FAQ Page</option>
                  <option value="howto">How-To Guide</option>
                  <option value="localBusiness">Local Business</option>
                  <option value="organization">Organization</option>
                  <option value="breadcrumb">Breadcrumb List</option>
                </select>
              </div>

              {/* Dynamic Form Fields */}
              <div className="space-y-6">
                {schemaType === 'product' && (
                  <>
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product Name" className="w-full px-5 py-4" />
                    <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="Description" rows={3} className="w-full px-5 py-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="Price" className="w-full px-5 py-4" />
                      <select value={productCurrency} onChange={(e) => setProductCurrency(e.target.value)} className="w-full px-5 py-4">
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <input type="text" value={productBrand} onChange={(e) => setProductBrand(e.target.value)} placeholder="Brand Name" className="w-full px-5 py-4" />
                    <input type="url" value={productImage} onChange={(e) => setProductImage(e.target.value)} placeholder="Image URL" className="w-full px-5 py-4" />
                    <input type="number" step="0.1" max="5" value={productRating} onChange={(e) => setProductRating(e.target.value)} placeholder="Rating (0-5)" className="w-full px-5 py-4" />
                  </>
                )}

                {schemaType === 'article' && (
                  <>
                    <input type="text" value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} placeholder="Article Title" className="w-full px-5 py-4" />
                    <textarea value={articleDescription} onChange={(e) => setArticleDescription(e.target.value)} placeholder="Description" rows={3} className="w-full px-5 py-4" />
                    <input type="text" value={articleAuthor} onChange={(e) => setArticleAuthor(e.target.value)} placeholder="Author Name" className="w-full px-5 py-4" />
                    <input type="date" value={articleDate} onChange={(e) => setArticleDate(e.target.value)} className="w-full px-5 py-4" />
                    <input type="url" value={articleImage} onChange={(e) => setArticleImage(e.target.value)} placeholder="Featured Image URL" className="w-full px-5 py-4" />
                  </>
                )}

                {schemaType === 'faq' && (
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="p-4 bg-white/50 border border-ink/10 rounded-xl relative group">
                        <button onClick={() => removeFAQ(index)} className="absolute top-2 right-2 text-ink-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                        <input type="text" value={faq.question} onChange={(e) => updateFAQ(index, 'question', e.target.value)} placeholder="Question" className="w-full px-4 py-3 text-sm mb-2" />
                        <textarea value={faq.answer} onChange={(e) => updateFAQ(index, 'answer', e.target.value)} placeholder="Answer" rows={2} className="w-full px-4 py-3 text-sm" />
                      </div>
                    ))}
                    <button onClick={addFAQ} className="btn-secondary w-full text-sm uppercase tracking-widest py-3 flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Add Question
                    </button>
                  </div>
                )}

                {schemaType === 'howto' && (
                  <>
                    <input type="text" value={howtoTitle} onChange={(e) => setHowtoTitle(e.target.value)} placeholder="Guide Title" className="w-full px-5 py-4" />
                    <textarea value={howtoDescription} onChange={(e) => setHowtoDescription(e.target.value)} placeholder="Description" rows={2} className="w-full px-5 py-4" />
                    
                    <div className="space-y-4 mt-4">
                      <label className="block text-xs font-bold uppercase tracking-widest text-ink-muted">Steps</label>
                      {howtoSteps.map((step, index) => (
                        <div key={index} className="p-4 bg-white/50 border border-ink/10 rounded-xl relative group">
                           <button onClick={() => removeStep(index)} className="absolute top-2 right-2 text-ink-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                           <div className="grid grid-cols-1 gap-3">
                             <input type="text" value={step.name} onChange={(e) => updateStep(index, 'name', e.target.value)} placeholder={`Step ${index + 1} Title`} className="w-full px-4 py-3 text-sm font-medium" />
                             <textarea value={step.text} onChange={(e) => updateStep(index, 'text', e.target.value)} placeholder="Step details..." rows={2} className="w-full px-4 py-3 text-sm" />
                             <input type="url" value={step.image} onChange={(e) => updateStep(index, 'image', e.target.value)} placeholder="Step Image URL (optional)" className="w-full px-4 py-3 text-xs" />
                           </div>
                        </div>
                      ))}
                      <button onClick={addStep} className="btn-secondary w-full text-sm uppercase tracking-widest py-3 flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add Step
                      </button>
                    </div>
                  </>
                )}

                {schemaType === 'localBusiness' && (
                  <>
                    <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business Name" className="w-full px-5 py-4" />
                    <input type="url" value={businessImage} onChange={(e) => setBusinessImage(e.target.value)} placeholder="Image URL" className="w-full px-5 py-4" />
                    <input type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="Phone Number" className="w-full px-5 py-4" />
                    <select value={businessPriceRange} onChange={(e) => setBusinessPriceRange(e.target.value)} className="w-full px-5 py-4">
                      <option value="$">$ (Cheap)</option>
                      <option value="$$">$$ (Moderate)</option>
                      <option value="$$$">$$$ (Expensive)</option>
                      <option value="$$$$">$$$$ (Luxury)</option>
                    </select>
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-ink-muted">Address</label>
                      <input type="text" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Street Address" className="w-full px-5 py-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={businessCity} onChange={(e) => setBusinessCity(e.target.value)} placeholder="City" className="w-full px-5 py-4" />
                        <input type="text" value={businessZip} onChange={(e) => setBusinessZip(e.target.value)} placeholder="ZIP Code" className="w-full px-5 py-4" />
                      </div>
                      <input type="text" value={businessCountry} onChange={(e) => setBusinessCountry(e.target.value)} placeholder="Country" className="w-full px-5 py-4" />
                    </div>
                  </>
                )}

                {schemaType === 'breadcrumb' && (
                  <div className="space-y-4">
                    {breadcrumbs.map((crumb, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <span className="text-xs text-ink-muted w-6 font-bold">{index + 1}.</span>
                        <input type="text" value={crumb.name} onChange={(e) => updateBreadcrumb(index, 'name', e.target.value)} placeholder="Page Name" className="w-full px-4 py-3 text-sm" />
                        <input type="text" value={crumb.item} onChange={(e) => updateBreadcrumb(index, 'item', e.target.value)} placeholder="URL" className="w-full px-4 py-3 text-sm" />
                        <button onClick={() => removeBreadcrumb(index)} className="text-ink-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={addBreadcrumb} className="btn-secondary w-full text-sm uppercase tracking-widest py-3 flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Add Level
                    </button>
                  </div>
                )}

                {schemaType === 'organization' && (
                  <>
                    <input type="text" value={productBrand} onChange={(e) => setProductBrand(e.target.value)} placeholder="Organization Name" className="w-full px-5 py-4" />
                    <input type="url" value={productImage} onChange={(e) => setProductImage(e.target.value)} placeholder="Website URL" className="w-full px-5 py-4" />
                    <p className="text-xs text-ink-muted italic">This schema uses the same fields as the Product Brand setup for simplicity.</p>
                  </>
                )}
              </div>
            </div>

            {/* Output Section */}
            <div className="bg-ink rounded-[2rem] p-8 shadow-2xl flex flex-col max-h-[800px] animate-enter delay-200 text-white border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-wide">Generated JSON-LD</h2>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${
                    copied 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {copied ? <><CheckCircle className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Code</>}
                </button>
              </div>

              <div className="relative flex-1 overflow-hidden rounded-xl bg-black/30 border border-white/5">
                 <pre className="absolute inset-0 p-6 overflow-auto text-sm font-mono text-claude-100 leading-relaxed scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  <code>{generatedCode}</code>
                </pre>
              </div>

              <div className="mt-6 p-4 bg-claude-500/10 border border-claude-500/20 rounded-xl">
                <h3 className="text-claude-300 text-xs uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Instructions
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Copy this code and paste it into the <code className="text-claude-300 bg-white/10 px-1 py-0.5 rounded">&lt;head&gt;</code> section of your page HTML, or use a plugin like "Insert Headers and Footers".
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}