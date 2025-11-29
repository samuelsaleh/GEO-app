'use client'

import { useState, useEffect } from 'react'
import { Copy, CheckCircle, Code, ArrowLeft, Plus, Trash2, RefreshCw } from 'lucide-react'
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
    <div className="min-h-screen hero-gradient">
      {/* Navigation */}
      <nav className="glass-nav border-b border-cream-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/tools" className="flex items-center gap-3 text-ink-600 hover:text-ink-900 transition">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-light tracking-wide">Back to Tools</span>
            </Link>
            <div className="font-display text-2xl font-light tracking-wide text-ink-900">
              dwight
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-light mb-4 text-ink-900 tracking-wide">Schema Generator</h1>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto font-light leading-relaxed">
            Instantly generate semantic markup to help AI understand your content.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="card-elevated p-8 overflow-y-auto max-h-[800px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-light text-ink-900 tracking-wide">Configuration</h2>
              <div className="text-xs font-light text-claude-600 uppercase tracking-widest bg-claude-100 px-3 py-1 rounded-full">
                Auto-Updating
              </div>
            </div>

            {/* Schema Type Selector */}
            <div className="mb-8">
              <label className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">Schema Type</label>
              <select
                value={schemaType}
                onChange={(e) => setSchemaType(e.target.value as SchemaType)}
                className="w-full px-4 py-3 border border-cream-300 focus:border-claude-500 bg-white font-light rounded-sm"
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
                  <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product Name" className="input-field" />
                  <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="Description" rows={3} className="input-field" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="Price" className="input-field" />
                    <select value={productCurrency} onChange={(e) => setProductCurrency(e.target.value)} className="input-field">
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <input type="text" value={productBrand} onChange={(e) => setProductBrand(e.target.value)} placeholder="Brand Name" className="input-field" />
                  <input type="url" value={productImage} onChange={(e) => setProductImage(e.target.value)} placeholder="Image URL" className="input-field" />
                  <input type="number" step="0.1" max="5" value={productRating} onChange={(e) => setProductRating(e.target.value)} placeholder="Rating (0-5)" className="input-field" />
                </>
              )}

              {schemaType === 'article' && (
                <>
                  <input type="text" value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} placeholder="Article Title" className="input-field" />
                  <textarea value={articleDescription} onChange={(e) => setArticleDescription(e.target.value)} placeholder="Description" rows={3} className="input-field" />
                  <input type="text" value={articleAuthor} onChange={(e) => setArticleAuthor(e.target.value)} placeholder="Author Name" className="input-field" />
                  <input type="date" value={articleDate} onChange={(e) => setArticleDate(e.target.value)} className="input-field" />
                  <input type="url" value={articleImage} onChange={(e) => setArticleImage(e.target.value)} placeholder="Featured Image URL" className="input-field" />
                </>
              )}

              {schemaType === 'faq' && (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="p-4 bg-cream-50 border border-cream-200 rounded-sm relative group">
                      <button onClick={() => removeFAQ(index)} className="absolute top-2 right-2 text-ink-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                      <input type="text" value={faq.question} onChange={(e) => updateFAQ(index, 'question', e.target.value)} placeholder="Question" className="input-field mb-2" />
                      <textarea value={faq.answer} onChange={(e) => updateFAQ(index, 'answer', e.target.value)} placeholder="Answer" rows={2} className="input-field" />
                    </div>
                  ))}
                  <button onClick={addFAQ} className="w-full py-3 border border-dashed border-cream-400 text-ink-500 hover:border-claude-500 hover:text-claude-600 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-light">
                    <Plus className="w-4 h-4" /> Add Question
                  </button>
                </div>
              )}

              {schemaType === 'howto' && (
                <>
                  <input type="text" value={howtoTitle} onChange={(e) => setHowtoTitle(e.target.value)} placeholder="Guide Title" className="input-field" />
                  <textarea value={howtoDescription} onChange={(e) => setHowtoDescription(e.target.value)} placeholder="Description" rows={2} className="input-field" />
                  
                  <div className="space-y-4 mt-4">
                    <label className="block text-xs tracking-widest uppercase text-ink-500 font-light">Steps</label>
                    {howtoSteps.map((step, index) => (
                      <div key={index} className="p-4 bg-cream-50 border border-cream-200 rounded-sm relative group">
                         <button onClick={() => removeStep(index)} className="absolute top-2 right-2 text-ink-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                         <div className="grid grid-cols-1 gap-3">
                           <input type="text" value={step.name} onChange={(e) => updateStep(index, 'name', e.target.value)} placeholder={`Step ${index + 1} Title`} className="input-field font-medium" />
                           <textarea value={step.text} onChange={(e) => updateStep(index, 'text', e.target.value)} placeholder="Step details..." rows={2} className="input-field" />
                           <input type="url" value={step.image} onChange={(e) => updateStep(index, 'image', e.target.value)} placeholder="Step Image URL (optional)" className="input-field text-xs" />
                         </div>
                      </div>
                    ))}
                    <button onClick={addStep} className="w-full py-3 border border-dashed border-cream-400 text-ink-500 hover:border-claude-500 hover:text-claude-600 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-light">
                      <Plus className="w-4 h-4" /> Add Step
                    </button>
                  </div>
                </>
              )}

              {schemaType === 'localBusiness' && (
                <>
                  <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business Name" className="input-field" />
                  <input type="url" value={businessImage} onChange={(e) => setBusinessImage(e.target.value)} placeholder="Image URL" className="input-field" />
                  <input type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="Phone Number" className="input-field" />
                  <select value={businessPriceRange} onChange={(e) => setBusinessPriceRange(e.target.value)} className="input-field">
                    <option value="$">$ (Cheap)</option>
                    <option value="$$">$$ (Moderate)</option>
                    <option value="$$$">$$$ (Expensive)</option>
                    <option value="$$$$">$$$$ (Luxury)</option>
                  </select>
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs tracking-widest uppercase text-ink-500 font-light">Address</label>
                    <input type="text" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Street Address" className="input-field" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" value={businessCity} onChange={(e) => setBusinessCity(e.target.value)} placeholder="City" className="input-field" />
                      <input type="text" value={businessZip} onChange={(e) => setBusinessZip(e.target.value)} placeholder="ZIP Code" className="input-field" />
                    </div>
                    <input type="text" value={businessCountry} onChange={(e) => setBusinessCountry(e.target.value)} placeholder="Country" className="input-field" />
                  </div>
                </>
              )}

              {schemaType === 'breadcrumb' && (
                <div className="space-y-4">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <span className="text-xs text-ink-400 w-6">{index + 1}.</span>
                      <input type="text" value={crumb.name} onChange={(e) => updateBreadcrumb(index, 'name', e.target.value)} placeholder="Page Name" className="input-field" />
                      <input type="text" value={crumb.item} onChange={(e) => updateBreadcrumb(index, 'item', e.target.value)} placeholder="URL" className="input-field" />
                      <button onClick={() => removeBreadcrumb(index)} className="text-ink-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={addBreadcrumb} className="w-full py-3 border border-dashed border-cream-400 text-ink-500 hover:border-claude-500 hover:text-claude-600 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-light">
                    <Plus className="w-4 h-4" /> Add Level
                  </button>
                </div>
              )}

              {schemaType === 'organization' && (
                <>
                  <input type="text" value={productBrand} onChange={(e) => setProductBrand(e.target.value)} placeholder="Organization Name" className="input-field" />
                  <input type="url" value={productImage} onChange={(e) => setProductImage(e.target.value)} placeholder="Website URL" className="input-field" />
                  <p className="text-xs text-ink-400 italic">This schema uses the same fields as the Product Brand setup for simplicity.</p>
                </>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-ink-900 p-8 rounded-sm shadow-xl flex flex-col max-h-[800px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-light tracking-wide text-white">Generated JSON-LD</h2>
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                  copied 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                {copied ? <><CheckCircle className="w-3 h-3" /> COPIED</> : <><Copy className="w-3 h-3" /> COPY CODE</>}
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden rounded bg-ink-950 border border-ink-800">
               <pre className="absolute inset-0 p-6 overflow-auto text-sm font-mono text-claude-100 leading-relaxed scrollbar-thin scrollbar-thumb-ink-700 scrollbar-track-transparent">
                <code>{generatedCode}</code>
              </pre>
            </div>

            <div className="mt-6 p-4 bg-claude-900/20 border border-claude-800/50 rounded">
              <h3 className="text-claude-300 text-xs uppercase tracking-widest font-semibold mb-2">Instructions</h3>
              <p className="text-ink-400 text-sm font-light">
                Copy this code and paste it into the <code className="text-claude-300 bg-ink-950 px-1 py-0.5 rounded">&lt;head&gt;</code> section of your page HTML, or use a plugin like "Insert Headers and Footers".
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: white;
          border: 1px solid #e5e5e5; /* cream-300 */
          border-radius: 0.125rem;
          font-weight: 300;
          transition: all 0.2s;
        }
        .input-field:focus {
          outline: none;
          border-color: #7c3aed; /* claude-500 */
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
        }
      `}</style>
    </div>
  )
}
