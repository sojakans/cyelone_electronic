import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import {supabase} from '../lib/supabase';

import {electronicComponentsCatalog} from '../lib/componentsCatalog';
import type {Category,Product,Content} from '../lib/types';
const Context=createContext<{products:Product[];categories:Category[];content:Content;loading:boolean;error:string;reload:()=>Promise<void>}>({products:[],categories:[],content:{},loading:true,error:'',reload:async()=>{}});
export function CatalogProvider({children}:{children:ReactNode}){
 const [products,setProducts]=useState<Product[]>([]),[categories,setCategories]=useState<Category[]>([]),[content,setContent]=useState<Content>({}),[loading,setLoading]=useState(!!supabase),[error,setError]=useState('');
 const fetchProducts=async()=>{const all:Product[]=[];for(let from=0;;from+=500){const {data,error}=await supabase!.from('products').select('*').order('created_at',{ascending:false}).order('id').range(from,from+499);if(error)return {data:null,error};all.push(...(data||[]));if((data?.length||0)<500)return {data:all,error:null};}};
 const reload=useCallback(async()=>{if(!supabase)return;try{const [p,c,s]=await Promise.all([fetchProducts(),supabase.from('categories').select('*').order('sort_order'),supabase.from('site_content').select('*')]);if(p.error||c.error||s.error)throw p.error||c.error||s.error;const dbProducts = p.data || [];const dbSlugs = new Set(dbProducts.map(x => x.slug));const merged = [...dbProducts, ...electronicComponentsCatalog.filter(x => !dbSlugs.has(x.slug))];setProducts(merged);setCategories(c.data||[]);setContent(Object.fromEntries((s.data||[]).map(row=>[row.key,row.value])));setError('');}catch(e){setError(e instanceof Error?e.message:String((e as {message?:string})?.message||e));}finally{setLoading(false);}},[]);
 useEffect(()=>{reload();if(!supabase)return;const channel=supabase.channel('catalog').on('postgres_changes',{event:'*',schema:'public',table:'products'},()=>reload()).on('postgres_changes',{event:'*',schema:'public',table:'categories'},()=>reload()).on('postgres_changes',{event:'*',schema:'public',table:'site_content'},()=>reload()).subscribe();const refresh=()=>{if(document.visibilityState==='visible')reload();};document.addEventListener('visibilitychange',refresh);return()=>{supabase?.removeChannel(channel);document.removeEventListener('visibilitychange',refresh);};},[reload]);
 return <Context.Provider value={{products,categories,content,loading,error,reload}}>{children}</Context.Provider>;
}
export const useProducts=()=>useContext(Context);
