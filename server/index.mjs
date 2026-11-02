import express from 'express';
import {createClient} from '@supabase/supabase-js';
import {fileURLToPath} from 'node:url';
const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_ANON_KEY;
if(!url||!key)throw new Error('Supabase URL and publishable key are required.');
const client=(token)=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:token?{headers:{Authorization:`Bearer ${token}`}}:{}});
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'1mb'}));
app.use((_req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');next();});
app.get('/api/health',(_req,res)=>res.json({ok:true}));
app.get('/api/products',async(req,res)=>{const offset=Math.max(0,Math.min(100000,Number(req.query.offset)||0));const {data,error}=await client().from('products').select('*').order('created_at',{ascending:false}).range(offset,offset+499);res.status(error?502:200).json(error?{error:'Catalog temporarily unavailable'}:data);});
app.get('/api/categories',async(_req,res)=>{const {data,error}=await client().from('categories').select('*').order('sort_order');res.status(error?502:200).json(error?{error:'Categories temporarily unavailable'}:data);});
async function owner(req,res,next){const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];if(!token)return res.status(401).json({error:'Sign in required'});const db=client(token);const {data,error}=await db.auth.getUser(token);if(error||!data.user)return res.status(401).json({error:'Invalid session'});const result=await db.rpc('is_admin');if(result.error||result.data!==true)return res.status(403).json({error:'Owner access required'});req.db=db;next();}
const keys=['name','slug','category_id','description','specs','price','bulk_price','stock_qty','low_stock_threshold','is_available','is_featured','images','robot_part','is_bestseller'];
function payload(body){if(!body||Array.isArray(body)||typeof body!=='object')throw new Error('Invalid product');return Object.fromEntries(Object.entries(body).filter(([key])=>keys.includes(key)));}
const validId=(id)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
app.post('/api/products',owner,async(req,res)=>{const {data,error}=await req.db.from('products').insert(payload(req.body)).select().single();res.status(error?400:201).json(error?{error:error.message}:data);});
app.patch('/api/products/:id',owner,async(req,res)=>{if(!validId(req.params.id))return res.status(400).json({error:'Invalid product ID'});const {data,error}=await req.db.from('products').update(payload(req.body)).eq('id',req.params.id).select().single();res.status(error?400:200).json(error?{error:error.message}:data);});
app.delete('/api/products/:id',owner,async(req,res)=>{if(!validId(req.params.id))return res.status(400).json({error:'Invalid product ID'});const {error}=await req.db.from('products').delete().eq('id',req.params.id);if(error)return res.status(400).json({error:error.message});res.sendStatus(204);});
app.use('/api',(_req,res)=>res.status(404).json({error:'Not found'}));
const dist=fileURLToPath(new URL('../dist/',import.meta.url));app.use(express.static(dist));app.get(/.*/,(_req,res)=>res.sendFile('index.html',{root:dist}));
app.use((err,_req,res,_next)=>res.status(400).json({error:'Request could not be processed'}));
app.listen(Number(process.env.PORT)||3000,'127.0.0.1',()=>console.log('Ceylon Node server ready on http://127.0.0.1:'+ (process.env.PORT||3000)));
