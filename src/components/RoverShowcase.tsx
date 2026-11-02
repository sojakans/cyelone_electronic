import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {motion,useReducedMotion} from 'framer-motion';
import {Pause,Play,RotateCcw,ArrowUpRight} from 'lucide-react';
const parts=[
 {name:'Arduino controller',image:'arduino-uno-r3',url:'/products/arduino-uno-r3',x:-33,y:-27},
 {name:'Ultrasonic sensor',image:'hc-sr04-ultrasonic-sensor',url:'/products/hc-sr04-ultrasonic-sensor',x:0,y:-33},
 {name:'Motors & servos',image:'motors',url:'/contact',x:33,y:-27},
 {name:'Wires & connections',image:'jumper-wire-set',url:'/products/jumper-wire-set',x:-33,y:25},
 {name:'Power your project',image:'power',url:'/contact',x:0,y:31},
 {name:'Control modules',image:'single-channel-relay-module',url:'/products/single-channel-relay-module',x:33,y:25},
];
export default function RoverShowcase(){
 const reduced=useReducedMotion();const [paused,setPaused]=useState(false),[time,setTime]=useState(0),[visible,setVisible]=useState(!document.hidden);
 useEffect(()=>{const f=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',f);return()=>document.removeEventListener('visibilitychange',f)},[]);
 useEffect(()=>{if(paused||reduced||!visible)return;const timer=setInterval(()=>setTime(t=>(t+.1)%16),100);return()=>clearInterval(timer)},[paused,reduced,visible]);
 const exploded=reduced||time>=5;const phase=exploded?(time>=9||reduced?2:1):0;
 return <section className={`rover-cinema ${exploded?'exploded':'driving'} ${paused||reduced||!visible?'motion-paused':''}`} aria-label="Rover project animation">
 <div className="cinema-top"><span><i/> PROJECT 001 / SMART ROVER</span><span>BUILD IT. TAKE IT APART. MAKE IT YOURS.</span></div>
 <div className="rover-stage">
 <div className="rover-grid"/><div className="rover-road"/>
 <motion.div className="rover-vehicle" animate={exploded?{opacity:0,scale:1.25,x:0,y:0}:{opacity:1,scale:1,x:time<1?-180:time<3?-30:35,y:time<3?0:-5}} transition={{duration:reduced?0:exploded?.4:1.3}} aria-hidden="true"><img src="/images/components/rover.png" alt=""/><span className="speed-trail"/></motion.div>
 <div className="burst-ring" key={exploded?'burst':'drive'} aria-hidden="true"/>
 <div className="rover-parts" aria-hidden={!exploded}>{parts.map((p,i)=><motion.div className="rover-part" key={p.image} initial={false} animate={{left:`${50+(exploded?p.x:0)}%`,top:`${50+(exploded?p.y:0)}%`,opacity:exploded?1:0,scale:exploded?1:.15,rotate:exploded?0:(i-3)*18}} transition={{duration:reduced?0:.85,delay:reduced?0:i*.035,type:'spring',bounce:.18}} style={{pointerEvents:exploded?'auto':'none'}}><Link to={p.url} tabIndex={exploded?0:-1}><img src={`/images/components/${p.image}.png`} alt={p.name}/><span>{p.name}<ArrowUpRight size={12}/></span></Link></motion.div>)}</div>
 <div className={`rover-center ${exploded?'shown':''}`}><span>ONE IDEA.</span><strong>Endless<br/>possibilities.</strong></div>
 <div className="drive-caption" style={{opacity:exploded?0:1}}><span>A LITTLE CODE. A LOT OF POSSIBILITY.</span><strong>Watch your ideas move.</strong></div>
 </div>
 <div className="cinema-bottom"><div><p className="eyebrow">{['01 / IN MOTION','02 / INSIDE THE BUILD','03 / FIND YOUR NEXT COMPONENT'][phase]}</p><h2>{['A rover today. Your invention tomorrow.','One rover. Many building blocks.','The parts behind your next big idea.'][phase]}</h2></div><div className="cinema-actions"><button onClick={()=>setPaused(p=>!p)} disabled={!!reduced} aria-label={paused?'Play rover animation':'Pause rover animation'}>{paused?<Play size={16}/>:<Pause size={16}/>}</button><button aria-label="Replay rover animation" onClick={()=>{setTime(0);setPaused(false)}} disabled={!!reduced}><RotateCcw size={16}/></button><a className="button primary" href="#component-universe">Explore components <ArrowUpRight size={16}/></a></div></div>
 <div className="cinema-timeline">{['Drive','Explode','Explore'].map((s,i)=><button key={s} aria-pressed={phase===i} onClick={()=>{setTime([0,5,9][i]);setPaused(true)}}>{s}<span style={{background:phase===i?'#59d8ff':undefined}}/></button>)}</div>
 <p className="cinema-note">AI illustrations · Concept build; pictured parts and compatibility are illustrative.</p>
 </section>
}
export const componentGroups=[
 ['Arduino Uno R3','Arduino Uno R3 development board','arduino-uno-r3','/products'],
 ['HC-SR04 sensor','Ultrasonic distance sensor','hc-sr04-ultrasonic-sensor','/products'],
 ['Motors & robotics','DC motors, servos & steppers','motors','/contact'],
 ['Power & batteries','Cells, holders & converters','power','/contact'],
 ['Displays','Character LCD & OLED modules','displays','/contact'],
 ['LEDs & lighting','Indicator LEDs & RGB strips','leds','/contact'],
 ['Switches & controls','Buttons, rocker switch & potentiometer','switches','/contact'],
 ['Semiconductors','Diodes, transistors & ICs','semiconductors','/contact'],
 ['Resistors','Through-hole resistor assortments','resistor-assortment','/products/resistor-assortment'],
 ['Capacitors','Capacitors for your circuits','capacitor-kit','/products/capacitor-kit'],
 ['Modules & relays','Control and interface modules','single-channel-relay-module','/products/single-channel-relay-module'],
 ['Breadboard','830-point solderless breadboard','830-point-breadboard','/products'],
 ['Test equipment','Digital multimeters','digital-multimeter','/products/digital-multimeter'],
 ['Soldering tools','Build, solder & repair','soldering-iron-60w','/products/soldering-iron-60w'],
 ['Microcontrollers','ATmega, STM32, RP2040 & ESP families','esp32-development-board','/products'],
 ['Wireless modules','Wi-Fi, Bluetooth, RF & GPS boards','esp32-development-board','/products'],
 ['Distance sensors','Ultrasonic, IR & time-of-flight sensors','hc-sr04-ultrasonic-sensor','/products'],
 ['Environmental sensors','Temperature, humidity, pressure & gas','dht11-temperature-sensor','/products'],
 ['Motion sensors','PIR, accelerometer, gyro & IMU','hc-sr04-ultrasonic-sensor','/products'],
 ['Light sensors','LDR, photodiodes & color sensors','leds','/contact'],
 ['Audio components','Buzzers, microphones & small speakers','switches','/contact'],
 ['Motor drivers','H-bridge, stepper & servo controllers','motors','/contact'],
 ['DC motors','Geared, hobby & high torque motors','motors','/contact'],
 ['Servos & steppers','Micro servos and stepper motors','motors','/contact'],
 ['Power supplies','Adapters, bench supplies & USB power','power','/contact'],
 ['Voltage regulators','Buck, boost, linear & charger modules','power','/contact'],
 ['Battery holders','Holders, clips and battery accessories','power','/contact'],
 ['Rechargeable batteries','Li-ion, LiPo and NiMH cells','power','/contact'],
 ['LCD modules','16x2, 20x4 and character displays','displays','/contact'],
 ['OLED displays','Compact monochrome display modules','displays','/contact'],
 ['Seven segment displays','Single and multi digit numeric displays','displays','/contact'],
 ['LED indicators','Single, RGB and addressable LEDs','leds','/contact'],
 ['LED strips','RGB and individually addressable strips','leds','/contact'],
 ['Tactile switches','Push buttons and tactile switches','switches','/contact'],
 ['Toggle & rocker switches','Panel and inline power switches','switches','/contact'],
 ['Potentiometers','Rotary controls and trimmer resistors','switches','/contact'],
 ['Connectors & terminals','Headers, plugs, sockets and screw terminals','jumper-wire-set','/contact'],
 ['Diodes & rectifiers','Signal, switching, Schottky and power diodes','semiconductors','/contact'],
 ['Transistors & MOSFETs','BJT and field effect transistor families','semiconductors','/contact'],
 ['Integrated circuits','Logic, timers, op amps and interface ICs','semiconductors','/contact'],
 ['Logic & level shifting','Logic gates and voltage level converters','semiconductors','/contact'],
 ['Fuses & protection','Fuses, holders and circuit protection','switches','/contact'],
 ['Breadboards','Solderless prototyping boards','830-point-breadboard','/products'],
 ['Perfboards & PCBs','Stripboard and prototype circuit boards','830-point-breadboard','/contact'],
 ['Jumper wires','Male/female Dupont leads and ribbon wire','jumper-wire-set','/products/jumper-wire-set'],
 ['Measurement tools','Multimeters, probes and test leads','digital-multimeter','/products/digital-multimeter'],
 ['Soldering accessories','Solder wire, tips and desoldering tools','soldering-iron-60w','/products/soldering-iron-60w'],
 ['Enclosures & mounting','Project boxes, standoffs and brackets','switches','/contact'],
 ['Robotics kits','Chassis, wheels and starter robot kits','rover','/contact'],
];
export function ComponentUniverse(){return <section className="container section" id="component-universe"><p className="eyebrow">FROM THE FIRST LED TO A COMPLETE ROBOT</p><h2>A whole world of components.</h2><p>Explore component families for your next build. Ask us about availability and variants.</p><div className="universe-grid">{componentGroups.slice(0,14).map(([name,description,img,url])=><Link className="universe-card" key={name} to={url}><div><img src={`/images/components/${img}.png`} alt={name} loading="lazy"/></div><h3>{name}<ArrowUpRight size={15}/></h3><p>{description}</p><small>{url==='/contact'?'Ask about availability':'Explore catalog'}</small></Link>)}</div><p className="cinema-note">AI illustrations show the named component or group; actual stock may vary.</p><h3>More component families</h3><p>Ask about these parts. Product photos will appear when the owner adds the matching items.</p><div className="component-directory">{componentGroups.slice(14).map(([name,description,,url])=><Link key={name} to={url}><strong>{name}</strong><span>{description}</span></Link>)}</div></section>}
