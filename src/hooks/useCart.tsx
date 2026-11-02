import {createContext,useContext,useState,useEffect,type ReactNode} from 'react';
import toast from 'react-hot-toast';
import {useProducts} from './useProducts';
import type {Product} from '../lib/types';
type Item={id:string;qty:number};
const Context=createContext<{items:Item[];add:(p:Product)=>void;setQty:(id:string,qty:number)=>void;clear:()=>void}>({items:[],add:()=>{},setQty:()=>{},clear:()=>{}});
export function CartProvider({children}:{children:ReactNode}){
 const {products}=useProducts();
 const [items,setItems]=useState<Item[]>(()=>{try{const v=JSON.parse(localStorage.getItem('ceylon-cart-v1')||'[]');return Array.isArray(v)?v.filter(x=>typeof x.id==='string'&&Number.isInteger(x.qty)&&x.qty>0).slice(0,100):[];}catch{return [];}});
 useEffect(()=>{try{localStorage.setItem('ceylon-cart-v1',JSON.stringify(items));}catch{}},[items]);
 const setQty=(id:string,qty:number)=>setItems(old=>old.flatMap(x=>x.id===id?(qty>0?[{id,qty:Math.min(999,qty)}]:[]):[x]));
 const add=(p:Product)=>{const current=products.find(x=>x.id===p.id);if(!current?.is_available||current.stock_qty<1){toast.error('This item is currently unavailable.');return;}setItems(old=>{const q=old.find(x=>x.id===p.id)?.qty||0;if(q>=current.stock_qty)return old;return [...old.filter(x=>x.id!==p.id),{id:p.id,qty:q+1}];});toast.success('Added to your cart');};
 return <Context.Provider value={{items,add,setQty,clear:()=>setItems([])}}>{children}</Context.Provider>;
}
export const useCart=()=>useContext(Context);
