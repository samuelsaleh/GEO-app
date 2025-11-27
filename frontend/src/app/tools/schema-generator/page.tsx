'use client'

import { useState } from 'react'
import { Copy, CheckCircle, Code, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type SchemaType = 'product' | 'article' | 'faq' | 'howto' | 'organization'

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

  const addFAQ = () => {
    setFaqs([...faqs, { question: '', answer: '' }])
  }

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs]
    newFaqs[index][field] = value
    setFaqs(newFaqs)
  }

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const generateSchema = () => {
    let schema: any = {}

    switch (schemaType) {
      case 'product':
        schema = {
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": productName,
          "description": productDescription,
          "image": productImage,
          "brand": {
            "@type": "Brand",
            "name": productBrand
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
            "bestRating": "5",
            "worstRating": "1",
            "ratingCount": "1"
          }
        }
        break

      case 'article':
        schema = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": articleTitle,
          "description": articleDescription,
          "image": articleImage,
          "author": {
            "@type": "Person",
            "name": articleAuthor
          },
          "datePublished": articleDate,
          "dateModified": articleDate
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
          "name": articleTitle,
          "description": articleDescription,
          "image": articleImage,
          "step": []
        }
        break

      case 'organization':
        schema = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": productBrand,
          "url": productImage,
          "logo": productImage
        }
        break
    }

    const code = `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`
    setGeneratedCode(code)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Dwight
              </h1>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Code className="w-8 h-8 text-cyan-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Schema Generator</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create perfect schema markup (invisible labels) that help AI engines understand your content
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Configure Your Schema</h2>

            {/* Schema Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Schema Type</label>
              <select
                value={schemaType}
                onChange={(e) => {
                  setSchemaType(e.target.value as SchemaType)
                  setGeneratedCode('')
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="product">Product (e-commerce)</option>
                <option value="article">Article (blog post)</option>
                <option value="faq">FAQ Page</option>
                <option value="howto">How-To Guide</option>
                <option value="organization">Organization/Brand</option>
              </select>
            </div>

            {/* Dynamic Form Fields */}
            <div className="space-y-4">
              {schemaType === 'product' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g., Vegan Hiking Boots"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Description *</label>
                    <textarea
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      placeholder="Brief product description"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Price *</label>
                      <input
                        type="number"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        placeholder="89.99"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Currency</label>
                      <select
                        value={productCurrency}
                        onChange={(e) => setProductCurrency(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Brand Name</label>
                    <input
                      type="text"
                      value={productBrand}
                      onChange={(e) => setProductBrand(e.target.value)}
                      placeholder="e.g., EcoTrail"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Image URL</label>
                    <input
                      type="url"
                      value={productImage}
                      onChange={(e) => setProductImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Rating (optional)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={productRating}
                      onChange={(e) => setProductRating(e.target.value)}
                      placeholder="4.5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {schemaType === 'article' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Article Title *</label>
                    <input
                      type="text"
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      placeholder="e.g., Complete Guide to Vegan Hiking"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Description *</label>
                    <textarea
                      value={articleDescription}
                      onChange={(e) => setArticleDescription(e.target.value)}
                      placeholder="Brief article summary"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Author Name *</label>
                    <input
                      type="text"
                      value={articleAuthor}
                      onChange={(e) => setArticleAuthor(e.target.value)}
                      placeholder="e.g., Jane Smith"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Published Date *</label>
                    <input
                      type="date"
                      value={articleDate}
                      onChange={(e) => setArticleDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Featured Image URL</label>
                    <input
                      type="url"
                      value={articleImage}
                      onChange={(e) => setArticleImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {schemaType === 'faq' && (
                <>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold">FAQ #{index + 1}</span>
                          {faqs.length > 1 && (
                            <button
                              onClick={() => removeFAQ(index)}
                              className="text-red-500 text-sm hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                          placeholder="Question (e.g., Are these boots waterproof?)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                          placeholder="Answer"
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addFAQ}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-cyan-500 hover:text-cyan-600 transition"
                  >
                    + Add Another FAQ
                  </button>
                </>
              )}
            </div>

            <button
              onClick={generateSchema}
              className="w-full mt-6 bg-cyan-600 text-white px-6 py-4 rounded-lg hover:bg-cyan-700 transition font-semibold text-lg"
            >
              Generate Schema Code
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-slate-900 rounded-2xl p-8 shadow-lg text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Generated Code</h2>
              {generatedCode && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy Code
                    </>
                  )}
                </button>
              )}
            </div>

            {generatedCode ? (
              <>
                <pre className="bg-slate-950 p-6 rounded-lg overflow-x-auto text-sm font-mono mb-6">
                  <code className="text-green-400">{generatedCode}</code>
                </pre>

                <div className="bg-cyan-900/30 border border-cyan-700 rounded-lg p-6">
                  <h3 className="font-bold mb-3 text-cyan-300">📋 Next Steps:</h3>
                  <ol className="space-y-2 text-sm text-cyan-100">
                    <li>1. Copy the code above using the "Copy Code" button</li>
                    <li>2. Paste it in the <code className="bg-slate-800 px-2 py-1 rounded">&lt;head&gt;</code> section of your HTML</li>
                    <li>3. Or add it via Google Tag Manager as a Custom HTML tag</li>
                    <li>4. Test it with <a href="https://search.google.com/test/rich-results" target="_blank" className="underline">Google's Rich Results Test</a></li>
                  </ol>
                </div>
              </>
            ) : (
              <div className="bg-slate-800 rounded-lg p-12 text-center text-slate-400">
                <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Fill out the form and click "Generate Schema Code" to see your code here</p>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Schema Markup Matters for AI</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-bold mb-2">AI Understanding</h3>
              <p className="text-gray-600 text-sm">
                Schema helps ChatGPT, Bing Chat, and other AI engines correctly interpret your content
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="font-bold mb-2">Rich Results</h3>
              <p className="text-gray-600 text-sm">
                Get star ratings, FAQs, and enhanced snippets in Google search results
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-bold mb-2">Better Rankings</h3>
              <p className="text-gray-600 text-sm">
                Structured data improves your chances of being cited by AI and ranking higher
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
