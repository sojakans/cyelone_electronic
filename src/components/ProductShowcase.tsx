import {useEffect,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import {Link} from 'react-router-dom';
import {ArrowUpRight,ChevronLeft,ChevronRight,Pause,Play,Sparkles} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useProducts} from '../hooks/useProducts';
import {productImages} from '../lib/productImages';
import {money} from '../lib/domain';
import {StockBadge} from './UI';

export default function ProductShowcase(){
 const {products,categories}=useProducts();
 const {t}=useTranslation();
 const reduced=useReducedMotion();
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[visible,setVisible]=useState(!document.hidden);
 const items=products.filter(p=>p.images.length||productImages[p.slug]);
 const current=items[index%Math.max(items.length,1)];
 const playing=!paused&&!hovered&&!focused&&visible&&reduced===false&&items.length>1;
 useEffect(()=>{const change=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',change);return()=>document.removeEventListener('visibilitychange',change);},[]);
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setIndex(i=>(i+1)%items.length),6000);return()=>clearInterval(timer);},[playing,items.length,index]);
 useEffect(()=>{if(items.length<2)return;const next=items[(index+1)%items.length];const image=new Image();image.src=next.images[0]||productImages[next.slug];},[index,items.map(p=>p.id).join(',')]);
 if(!current)return null;
 const go=(direction:number)=>setIndex(i=>(i+direction+items.length)%items.length);
 const picture=current.images[0]||productImages[current.slug];
 const generated=!current.images.length||picture.startsWith('/images/components/');
 return <section className={`product-showcase ${playing?'is-playing':''}`} aria-label={t('Animated component showcase')} aria-roledescription="carousel" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setFocused(false);}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();go(1);}if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}}}>
  <div className="showcase-topline"><span><Sparkles size={13}/>{t('ON THE WORKBENCH')}</span><span className="showcase-counter">{String(index%items.length+1).padStart(2,'0')} <i>/ {String(items.length).padStart(2,'0')}</i></span></div>
  <div className="showcase-stage">
   <div className="showcase-grid"/><div className="showcase-halo"/><div className="showcase-ring ring-a"/><div className="showcase-ring ring-b"/>
   <AnimatePresence mode="wait">
    <motion.div className="showcase-object" key={current.id} initial={reduced?{opacity:0}:{opacity:0,y:22,scale:.9,rotate:-5}} animate={{opacity:1,y:0,scale:1,rotate:0}} exit={reduced?{opacity:0}:{opacity:0,y:-18,scale:1.05,rotate:3}} transition={{duration:reduced?0:.65,ease:[.22,1,.36,1]}}>
     <motion.img className="showcase-image" src={picture} alt={current.name} width={1254} height={1254} loading="eager" fetchPriority="high" animate={playing?{y:[0,-9,0],rotate:[0,-1,0]}:{y:0,rotate:0}} transition={{duration:5.5,repeat:playing?Infinity:0,ease:'easeInOut'}}/>
    </motion.div>
   </AnimatePresence>
   <div className="showcase-accent accent-left"/><div className="showcase-accent accent-right"/>
  </div>
  <div className="showcase-details" aria-live={paused?'polite':'off'} aria-atomic="true">
   <p className="eyebrow">{categories.find(c=>c.id===current.category_id)?.name||t('Electronic components')}</p>
   <h2>{current.name}</h2>
   <div className="showcase-price"><strong>{money(current.price)}</strong><StockBadge product={current}/><Link to={`/products/${current.slug}`} aria-label={`${t('Explore product')}: ${current.name}`}>{t('Explore product')}<ArrowUpRight size={16}/></Link></div>
  </div>
  <div className="showcase-controls"><div className="showcase-dots">{items.map((p,i)=><button key={p.id} className={i===index%items.length?'active':''} aria-label={`${t('Show')}: ${p.name}`} aria-current={i===index%items.length?'true':undefined} onClick={()=>setIndex(i)}><span/></button>)}</div><div className="showcase-buttons"><button onClick={()=>go(-1)} aria-label={t('Previous product')}><ChevronLeft size={16}/></button>{!reduced&&<button onClick={()=>setPaused(p=>!p)} aria-label={t(paused?'Play animation':'Pause animation')}>{paused?<Play size={13}/>:<Pause size={13}/>}</button>}<button onClick={()=>go(1)} aria-label={t('Next product')}><ChevronRight size={16}/></button></div></div>
  <p className="showcase-disclosure">{generated?t('AI-generated illustration · Actual product may vary.'):t('Product showcase')}</p>
  <div className="showcase-progress" aria-hidden="true"><span key={`${current.id}-${playing}`} style={{animationPlayState:playing?'running':'paused'}}/></div>
 </section>;
}
