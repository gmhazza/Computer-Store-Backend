const express = require('express')
const cors = require('cors')
const generateResponse = require('./responceGen.js')
require('dotenv').config()

const supabase = require('./database/supabase.js')

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://computer-store-pk.vercel.app'
  ]
}));


const filters = {
category: null,
brand: null,
search: '',
minPrice: null,
maxPrice: null,
inStock: false,
sort: 'created_at',
sortDir: 'desc',
page: 1,
perPage: 12,
}


app.get('/login', async (req, res) => {
    const { error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.SUPABASE_EMAIL,
    password: process.env.SUPABASE_PASSWORD,
    });
    console.log(authError);
    if (authError) {
        res.status(500).json({ success: false, message: 'Failed to log in to Supabase', error: authError });
    }
    else {
        res.json({ success: true, message: 'Successfully logged in to Supabase' });
    }
});

app.post('/gemini', async (req, res) => {
    const prompt = req.body
    try {
        const { data, error } = await supabase.from('products').select('*')
        console.log('data: ', data)
        console.log('error: ', error)
        prompt.prompt += '\n I am also providing you available products. Answer the question based on the available products if necessary. Here are the available products: ' + JSON.stringify(data)
    } catch (error) {
        console.error('Error fetching products from Supabase:', error);
        res.status(500).json({ success: false, message: 'Error fetching products from Supabase' });
        return;
    }

    const generatedResponse = await generateResponse(prompt.prompt)
    res.json(generatedResponse)
    
})

app.post('/fetchallproducts', async (req, res) => {
  const customFilters = req.body || {}

  try {
    const f = { ...filters, ...customFilters }
    let query = supabase
      .from('products')
      .select('*, categories(name, slug), brands(name, slug)', { count: 'exact' })
      .eq('is_active', true)

    if (f.category) query = query.eq('category_id', f.category)
    if (f.brand) query = query.eq('brand_id', f.brand)
    if (f.search) query = query.ilike('name', `%${f.search}%`)
    if (f.minPrice != null) query = query.gte('price', f.minPrice)
    if (f.maxPrice != null) query = query.lte('price', f.maxPrice)
    if (f.inStock) query = query.gt('stock_quantity', 0)

    const from = (f.page - 1) * f.perPage
    const to = from + f.perPage - 1
    query = query.order(f.sort, { ascending: f.sortDir === 'asc' }).range(from, to)

    const { data, error, count } = await query
    if (error) throw error

    res.json({
      success: true,
      products: data || [],
      total: count || 0,
    })
  } catch (err) {
    console.error('fetchallproducts error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/fetchproduct', async (req, res) => {
  const { slug } = req.body || {}

  if (!slug) {
    return res.status(400).json({ success: false, error: 'slug is required' })
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, slug), brands(id, name, slug)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      // PGRST116 = no rows found (or more than one) for .single()
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Product not found' })
      }
      throw error
    }

    res.json({ success: true, product: data })
  } catch (err) {
    console.error('fetchproduct error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/fetchfeatured', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), brands(name, slug)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) throw error

    res.json({ success: true, products: data || [] })
  } catch (err) {
    console.error('fetchfeatured error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/fetchrelated', async (req, res) => {
  const { categoryId, excludeId, limit = 4 } = req.body || {}

  if (!categoryId) {
    return res.status(400).json({ success: false, error: 'categoryId is required' })
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), brands(name, slug)')
      .eq('is_active', true)
      .eq('category_id', categoryId)
      .neq('id', excludeId)
      .order('is_featured', { ascending: false })
      .limit(limit)

    if (error) throw error

    res.json({ success: true, products: data || [] })
  } catch (err) {
    console.error('fetchrelated error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/resetfilters', async (req, res) => {
  // Reset the filters to their default values
  Object.assign(filters, req.body)

  res.json(filters)
})

app.listen(port, () => {
    console.log(`Server is live on port ${port}`)
})