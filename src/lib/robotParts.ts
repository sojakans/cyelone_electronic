export const robotParts = [
 {id:'uno',name:'Arduino Uno R3',description:'The controller at the heart of the build.',color:'#167c9e'},
 {id:'driver',name:'L298N motor driver',description:'Dual-channel control for the four geared motors.',color:'#c3313b'},
 {id:'motors',name:'DC geared motors',description:'Four yellow TT motors turn code into movement.',color:'#e8b923'},
 {id:'wheels',name:'Robot wheels',description:'Four rubber tyres with lightweight hubs.',color:'#d6a80f'},
 {id:'chassis',name:'Acrylic chassis',description:'Two decks support the electronics and drivetrain.',color:'#202d3d'},
 {id:'sensor',name:'Ultrasonic sensor',description:'Twin transducers measure the distance ahead.',color:'#167c9e'},
 {id:'servo',name:'SG90 micro servo',description:'Turns the distance sensor to scan the surroundings.',color:'#2563eb'},
 {id:'battery',name:'Rechargeable battery pack',description:'The removable power source for the robot.',color:'#7754b5'},
 {id:'holder',name:'Battery holder',description:'Secures the cells on the upper deck.',color:'#263448'},
 {id:'wires',name:'Jumper wires',description:'Connect power, sensors and control signals.',color:'#e95547'},
 {id:'switch',name:'Power switch',description:'A physical on/off control for the build.',color:'#de3f4a'},
 {id:'hardware',name:'Mounting hardware',description:'Standoffs, nuts and bolts hold the decks together.',color:'#b5bfcb'},
 {id:'bluetooth',name:'Bluetooth module',description:'A wireless serial link for remote control.',color:'#23847a'},
 {id:'line',name:'Line tracking module',description:'Downward-facing infrared sensors follow a track.',color:'#263448'},
] as const;
export type RobotPartId=typeof robotParts[number]['id'];
