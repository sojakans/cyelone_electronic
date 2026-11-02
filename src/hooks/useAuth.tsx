import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import type {Session} from '@supabase/supabase-js';
import {supabase} from '../lib/supabase';
const Context=createContext<{session:Session|null;admin:boolean;loading:boolean}>({session:null,admin:false,loading:true});
export function AuthProvider({children}:{children:ReactNode}){
 const [session,setSession]=useState<Session|null>(null),[admin,setAdmin]=useState(false),[loading,setLoading]=useState(!!supabase);
 useEffect(()=>{if(!supabase)return;let alive=true,generation=0;const check=async(s:Session|null)=>{const current=++generation;if(!alive)return;setSession(s);setAdmin(false);setLoading(true);if(!s){setLoading(false);return;}const {data,error}=await supabase!.rpc('is_admin');if(alive&&current===generation){setAdmin(!error&&data===true);setLoading(false);}};supabase.auth.getSession().then(({data})=>check(data.session));const {data}=supabase.auth.onAuthStateChange((_event,s)=>{setTimeout(()=>check(s),0);});return()=>{alive=false;data.subscription.unsubscribe();};},[]);
 useEffect(()=>{if(!session||!supabase)return;let last=Date.now();const touch=()=>{last=Date.now();};const events=['pointerdown','keydown','touchstart'];events.forEach(e=>window.addEventListener(e,touch));const timer=window.setInterval(()=>{if(Date.now()-last>=15*60*1000){supabase?.auth.signOut({scope:'local'});}},10000);return()=>{clearInterval(timer);events.forEach(e=>window.removeEventListener(e,touch));};},[session]);
 return <Context.Provider value={{session,admin,loading}}>{children}</Context.Provider>;
}
export const useAuth=()=>useContext(Context);
