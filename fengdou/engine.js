(function (root) {
  'use strict';
  // Map artwork uses the original 1500 x 1000 coordinates. Gameplay uses a campus twice as wide and tall.
  const MAP_SCALE=2;
  const WORLD={width:1500*MAP_SCALE,height:1000*MAP_SCALE};
  const mapPoint=(x,y)=>({x:x*MAP_SCALE,y:y*MAP_SCALE});
  const WALLS=[[555,465,240,108],[900,275,127,63],[732,273,113,70],[291,235,101,80],[758,691,316,96],[1135,478,87,113],[1310,834,85,52],[540,35,270,173]].map(w=>w.map(n=>n*MAP_SCALE));
  const MAP_LABELS=[['萃英山',120,305],['西区操场',398,115],['游泳馆',342,322],['昆仑堂',650,568],['贺兰堂',786,350],['天山堂',965,350],['东区操场',1400,275],['正门',1450,565],['第二教学楼',911,784],['隆基大道',1150,425],['安宁大道',968,657]].map(([text,x,y])=>({text,...mapPoint(x,y)}));
  const TYPES = [
    {id:'future',name:'未来搭子',icon:'✨',skill:'默契连发',desc:'发射穿透星光，和 Fengdou 一起打开局面。',quote:'还没想好干什么？先一起出门。',color:'#83b98c',sprite:2,cd:1.0},
    {id:'jade',name:'碧玉妹妹',icon:'💚',skill:'碧玉守护',desc:'环形守护波击退敌人，并持续恢复社交电量。',quote:'放心，续航这件事交给我。',color:'#8ab79a',sprite:3,cd:3.2},
    {id:'yiting',name:'王逸婷',icon:'🌟',skill:'星光速攻',desc:'快速发射穿透星光，高频压制来袭对手。',quote:'人齐了就出发，今天不鸽！',color:'#d8b86e',sprite:4,cd:.7}
  ];
  const RIVALS = [
    {id:'stars',name:'星辰传奇指南',icon:'🌠',color:'#8e9ed0',sprite:0,desc:'星轨散射 · 扇形星光弹幕'},
    {id:'kakax',name:'kakax',icon:'🎮',color:'#82c6b1',sprite:1,desc:'突然加速 · 间歇性冲锋'},
    {id:'debt',name:'我欠师姐五十亿',icon:'📒',color:'#d6ae7f',sprite:2,desc:'厚厚账本 · 高耐力慢速接近'},
    {id:'micro',name:'虎牙辛吉德',icon:'🔬',color:'#79aac6',sprite:3,desc:'精确计算 · 瞄准你的当前位置'},
    {id:'zoe',name:'中年男娘zoe',icon:'💜',color:'#b496cd',sprite:4,desc:'华丽回旋 · 环绕泡泡弹幕'},
    {id:'nasus',name:'我内个瑟斯',icon:'🐾',color:'#baa16e',sprite:5,desc:'稳步压进 · 越到后期越难击退'},
    {id:'feng',name:'冯子恩',icon:'🎋',color:'#a9b270',sprite:6,desc:'竹节竞走 · 竹筒关节摇摆着快速逼近'},
    {id:'fire',name:'银泉火旺',icon:'🔥',color:'#d99a60',sprite:7,desc:'火花环击 · 第三关压轴登场'}
  ];
  const BRANCHES = [
    {id:'fiji',name:'斐济被',icon:'🛡️',color:'#78b8ae',tag:'护盾 · 续航'},
    {id:'youth',name:'青训',icon:'🏅',color:'#dcbd57',tag:'训练 · 强化'},
    {id:'chaos',name:'精神病爆发',icon:'💥',color:'#c69ab8',tag:'随机 · 爆发'}
  ];
  const SKILLS = [
    {id:'quilt',branch:'fiji',name:'尿门大开不滴尿',icon:'🛡️',desc:'稳得住：定期蓄出护盾，抵消受击；升级增加护盾层数。'},
    {id:'recharge',branch:'fiji',name:'崩起盆底肌',icon:'🔋',desc:'核心收紧：每秒恢复 0.8 电量，升级叠加恢复效果。'},
    {id:'domain',branch:'fiji',name:'赐予秒射的能力',icon:'⚡',desc:'解锁高速连射，锁定最近敌人；升级增加连射伤害。'},
    {id:'fundamentals',branch:'youth',name:'LOLM 青训',icon:'🎯',desc:'对线基本功：每级全队伤害 +25%，走位和输出都要有。'},
    {id:'sprint',branch:'youth',name:'杀戮尖塔青训',icon:'🃏',desc:'每 6 秒轮抽力量、防御、治疗牌：加伤、加盾或回血。'},
    {id:'combo',branch:'youth',name:'雀魂青训',icon:'🀄',desc:'牌效率训练：出招加快 20%，定期追加三张麻将弹幕。'},
    {id:'megaphone',branch:'chaos',name:'边竞走边喊救命',icon:'📣',desc:'移动更快，边走边喊；每 3 秒释放一圈求救冲击波。'},
    {id:'random',branch:'chaos',name:'狗男女制作一次',icon:'👥',desc:'每 7 秒召出一对分身，短时间自动向敌人交叉开火。'},
    {id:'overload',branch:'chaos',name:'很思虑',icon:'💭',desc:'思虑 4 秒：进入伤害爆发，思维场减速周围敌人。'}
  ];
  const STAGES = [
    {id:'campus',name:'校园初遇',scene:'白天校园',subtitle:'教学区出发，先把小队组起来。',duration:180,boss:1,bossAt:150,roster:[0,1,2,3,6],hp:1,speed:1,spawn:1.55,tint:'',start:{x:940,y:560},landmark:'tianshan'},
    {id:'park',name:'公园邀约',scene:'傍晚公园',subtitle:'袁山公园旁歇脚，留意远程弹幕。',duration:180,boss:6,bossAt:150,roster:[2,3,4,5,6],hp:1.35,speed:1.08,spawn:1.35,tint:'#ecac5730',start:{x:470,y:830},landmark:'yuanshan'},
    {id:'night',name:'榆中不眠夜',scene:'夜晚👻地带',subtitle:'八方对手齐上阵，银泉火旺压轴。',duration:180,boss:7,bossAt:150,roster:[0,1,2,3,4,5,6,7],hp:1.7,speed:1.12,spawn:1.15,tint:'#16275375',start:{x:1080,y:870},landmark:'yuzhong'}
  ].map(s=>({...s,start:mapPoint(s.start.x,s.start.y)}));
  const xpThreshold=level=>20+8*(level-1)+Math.floor(.9*Math.pow(level-1,1.5));
  const SKILL_MAP=Object.fromEntries(SKILLS.map(s=>[s.id,s]));
  const TYPE_MAP = Object.fromEntries(TYPES.map(t => [t.id,t]));
  const LANDMARKS = [
    {id:'tianshan',name:'天山堂二楼男厕进门数五个或者六个坑位的蹲便器上',title:'天山堂 · 神秘坑位',mapName:'天山堂 · 第五／六坑',icon:'🚪',x:960,y:390,color:'#69b5a9',tag:'斐济被技能觉醒',desc:'第五坑稳稳叠盾，第六坑直接连射。两个坑位，选一个就行。'},
    {id:'yuanshan',name:'袁山公园旁边',title:'袁山公园旁边',mapName:'袁山公园旁边',icon:'🌳',x:370,y:770,color:'#88ae63',tag:'回电量 · 约搭子',desc:'恢复 45 电量，再邀请或升星一位搭子。满级搭子会给全队加伤。'},
    {id:'yuzhong',name:'榆中这个鸟不拉屎的👻地方',title:'榆中👻地带',mapName:'榆中👻地带',icon:'👻',x:1200,y:870,color:'#b591c5',tag:'十秒挑战 · 爆发觉醒',desc:'接受挑战后躲开强化对手，坚持 10 秒，领取爆发系技能和 500 分。'}
  ].map(m=>({...m,...mapPoint(m.x,m.y)}));
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function cameraFrame(width,height,focus,zoom=1){
    const w=Math.max(1,width),h=Math.max(1,height);
    const scale=Math.max(w/WORLD.width,h/WORLD.height,clamp(h/780,.6,1.05)*clamp(zoom,.8,1.5));
    const visibleWidth=w/scale,visibleHeight=h/scale;
    return{scale,x:clamp(focus.x-visibleWidth/2,0,Math.max(0,WORLD.width-visibleWidth)),y:clamp(focus.y-visibleHeight/2,0,Math.max(0,WORLD.height-visibleHeight)),visibleWidth,visibleHeight};
  }
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  class Game {
    constructor(random=Math.random) { this.random=random; this.width=WORLD.width;this.height=WORLD.height;this.duration=180;this.reset(); }
    reset(){
      this.status='ready';this.stageIndex=0;this.duration=STAGES[0].duration;this.time=0;this.completedTime=0;this.completedStages=[];this.bossesKilled=0;this.stageStartKills=0;
      this.level=1;this.xp=0;this.need=xpThreshold(1);this.upgradeCooldown=0;this.kills=0;this.bossKilled=false;this.bossSpawned=false;
      this.events=[];this.enemies=[];this.shots=[];this.enemyShots=[];this.effects=[];this.gems=[];this.team=[];this.options=[];this.spawnClock=1.2;this.heroClock=.2;
      this.buffs={power:0,magnet:0,haste:0};this.skills={};this.resetEvolutions();this.skillClock={quilt:0,domain:0,megaphone:0,random:0,overload:0,sprint:0,combo:0};
      this.shield=0;this.frenzy=0;this.cardIndex=0;this.cardPower=0;this.clones=0;this.cloneClock=0;this.moving=false;
      this.player={...STAGES[0].start,hp:100,maxHp:100,r:17,dx:0,dy:1,invincible:0,dash:0,dashCooldown:0};this.nextId=1;
      this.meetups=[{x:660,y:600,name:'昆仑堂集合点',icon:'✨',pool:['future'],used:false},{x:1260,y:400,name:'体育馆集合点',icon:'🌟',pool:['yiting'],used:false},{x:265,y:440,name:'萃英山集合点',icon:'💚',pool:['jade'],used:false}].map(m=>({...m,...mapPoint(m.x,m.y)}));
      this.meetingCooldown=0;this.phase=0;this.resetLandmarks();return this;
    }
    activePlayers(){return [this.player];}
    targetFor(entity){return this.activePlayers().reduce((a,b)=>dist(a,entity)<dist(b,entity)?a:b,this.player);}
    damagePlayer(player,amount){this.takeDamage(amount);}
    get stage(){return STAGES[this.stageIndex];}
    get elapsed(){return this.completedTime+this.time;}
    nextStage(){
      if(this.status!=='stage-clear')throw new Error('本关尚未完成');
      this.completedTime+=this.time;this.stageIndex++;this.duration=this.stage.duration;this.time=0;this.phase=0;this.stageStartKills=this.kills;
      this.bossKilled=false;this.bossSpawned=false;this.evolutionZones=[];this.evolutionCombat.burst=null;this.enemies=[];this.shots=[];this.enemyShots=[];this.effects=[];this.gems=[];this.options=[];this.spawnClock=1.5;this.heroClock=.3;
      this.player.x=this.stage.start.x;this.player.y=this.stage.start.y;this.player.hp=Math.min(this.player.maxHp,this.player.hp+35);this.player.invincible=3;this.player.dash=0;this.player.dashCooldown=0;
      this.meetups.forEach(m=>m.used=false);this.landmarks.forEach(m=>{m.state='unvisited';m.armed=true;});this.currentLandmark=null;this.landmarkOptions=[];this.challenge=null;this.meetingCooldown=2;
      this.upgradeCooldown=Math.max(8,this.upgradeCooldown);this.status='running';this.emit('stage-start',{stage:this.stageIndex});return this.snapshot();
    }
    emit(type,data={}){this.events.push({type,...data});}
    drain(){const out=this.events;this.events=[];return out;}
    start(id='future'){if(!TYPE_MAP[id])throw new Error('未知搭子类型');this.reset();this.status='running';this.recruit(id);this.emit('start');return this.snapshot();}
    resetLandmarks(){this.landmarks=LANDMARKS.map(m=>({...m,state:'unvisited',armed:true}));this.currentLandmark=null;this.landmarkOptions=[];this.challenge=null;this.landmarkBonus=0;}
    skillOption(id){const s=SKILL_MAP[id];return{...s,kind:'skill',nextLevel:Math.min(3,(this.skills[id]||0)+1)};}
    grantSkill(id){this.upgradeCooldown=Math.max(12,this.upgradeCooldown);if((this.skills[id]||0)<3){this.skills[id]=(this.skills[id]||0)+1;this.skillClock[id]=0;this.emit('skill',{id});return true;}this.player.hp=Math.min(this.player.maxHp,this.player.hp+35);return false;}
    visitLandmark(id){const m=this.landmarks.find(m=>m.id===id);if(this.status!=='running'||!m||m.state!=='unvisited'||!m.armed)return false;this.currentLandmark=m;m.armed=false;this.status='landmark';
      if(id==='tianshan')this.landmarkOptions=[{id:'fifth',icon:'⑤',name:'就第五个坑位',desc:'「尿门大开不滴尿」升一级，立即获得 3 层护盾。',skill:'quilt'},{id:'sixth',icon:'⑥',name:'再往里走一个',desc:'「赐予秒射的能力」升一级，立即获得 1 层护盾。',skill:'domain'}].map(o=>({...o,desc:o.desc+((this.skills[o.skill]||0)>=3?'（技能已满级，改为恢复 35 电量）':'')}));
      else if(id==='yuanshan')this.landmarkOptions=TYPES.map(t=>{const level=this.team.find(c=>c.id===t.id)?.level||0;return{id:t.id,icon:t.icon,name:t.name,desc:'恢复 45 电量；'+(level===3?'默契已满，全队伤害 +18%。':level?'默契升至 '+(level+1)+' 星。':'邀请加入小队。')};});
      else this.landmarkOptions=this.duration-this.time>=12?[{id:'challenge',icon:'👻',name:'来都来了，挑战一下',desc:'强化对手包围！坚持 10 秒，可自由走位；成功恢复 35 电量，并选一招爆发系技能。'}]:[];
      this.emit('landmark',{id});return true;
    }
    leaveLandmark(){if(this.status!=='landmark')return false;this.currentLandmark=null;this.landmarkOptions=[];this.status='running';this.player.invincible=Math.max(this.player.invincible,1.5);this.meetingCooldown=1.5;return true;}
    chooseLandmark(index){if(this.status!=='landmark'||!Number.isInteger(index)||!this.landmarkOptions[index])throw new Error('当前没有这个地点选项');const m=this.currentLandmark,o=this.landmarkOptions[index],p=this.player;
      if(m.id==='tianshan'){this.grantSkill(o.skill);this.shield=Math.max(this.shield,o.id==='fifth'?3:1);m.state='complete';this.landmarkBonus+=150;this.emit('landmark-complete',{id:m.id,name:m.title,bonus:150});}
      else if(m.id==='yuanshan'){const hp=p.hp;if(this.team.some(c=>c.id===o.id&&c.level===3))this.buffs.power++;else this.recruit(o.id);p.hp=Math.min(p.maxHp,hp+45);m.state='complete';this.landmarkBonus+=150;this.emit('landmark-complete',{id:m.id,name:m.title,bonus:150});}
      else{if(this.duration-this.time<12)throw new Error('本局剩余时间不足');m.state='active';this.challenge={id:m.id,remaining:10,duration:10,spawnClock:3.3};this.spawnChallengeRivals(4);this.emit('challenge-start');}
      this.leaveLandmark();return o;
    }
    spawnChallengeRivals(count){for(let i=0;i<count&&this.enemies.length<90;i++){const e=this.enemy(),angle=this.random()*Math.PI*2;e.x=clamp(this.player.x+Math.cos(angle)*230,40,this.width-40);e.y=clamp(this.player.y+Math.sin(angle)*230,80,this.height-40);e.hp=e.maxHp=Math.round(e.maxHp*1.5);e.speed*=1.1;e.challenge=true;}}
    tickChallenge(dt){if(!this.challenge)return;const c=this.challenge;c.remaining=Math.max(0,c.remaining-dt);c.spawnClock-=dt;if(c.spawnClock<=0&&c.remaining>1){this.spawnChallengeRivals(2);c.spawnClock=3.3;}}
    completeChallenge(){if(!this.challenge||this.challenge.remaining>0||this.status!=='running')return;const m=this.landmarks.find(m=>m.id===this.challenge.id);m.state='complete';this.challenge=null;this.landmarkBonus+=500;this.player.hp=Math.min(this.player.maxHp,this.player.hp+35);this.options=SKILLS.filter(s=>s.branch==='chaos'&&(this.skills[s.id]||0)<3).map(s=>this.skillOption(s.id));if(!this.options.length)this.options=[{id:'heal',kind:'buff',name:'榆中热奶茶',icon:'🧋',desc:'爆发系已全部满级，再恢复 50% 最大电量。',branch:'chaos'}];this.status='upgrade';this.offerReason='榆中👻挑战成功 · 额外技能奖励';this.emit('landmark-complete',{id:m.id,name:m.title,bonus:500});this.emit('upgrade');}
    checkLandmarks(){for(const m of this.landmarks){const players=this.activePlayers();if(players.every(p=>dist(m,p)>90))m.armed=true;if(this.status==='running'&&this.meetingCooldown<=0&&players.some(p=>dist(m,p)<46)&&this.visitLandmark(m.id))break;}}
    recruit(id){const t=this.team.find(x=>x.id===id);if(t){t.level=Math.min(3,t.level+1);}else if(this.team.length<3){this.team.push({id,level:1,clock:.3+this.random()*.6});}this.updateStats();this.player.hp=Math.min(this.player.maxHp,this.player.hp+12);this.emit('recruit',{id,upgraded:!!t});}
    updateStats(){const fit=this.team.find(t=>t.id==='fitness');this.player.maxHp=100+(fit?fit.level*20:0);}
    get synergies(){const s=[];if(this.team.length>=2)s.push({name:'双人成行',desc:'两位搭子同行：出招速度 +20%',id:'haste'});if(this.team.length>=3){s.push({name:'全员到齐',desc:'三位搭子到齐：全队伤害 +20%',id:'power'});s.push({name:'谁也不落下',desc:'全员到齐：每秒恢复 1 电量',id:'heal'});}return s;}
    get power(){return (1+.18*this.buffs.power+.25*(this.skills.fundamentals||0)+this.cardPower)*(this.frenzy>0?1.6+.2*(this.skills.overload||0):1)*(1+.2*this.synergies.filter(s=>s.id==='power').length);}
    get haste(){return 1+.13*this.buffs.haste+.2*(this.skills.combo||0)+(this.synergies.some(s=>s.id==='haste')?.2:0);}
    pause(){if(this.status==='running'){this.status='paused';this.emit('pause');return true;}return false;}
    resume(){if(this.status==='paused'){this.status='running';this.emit('resume');return true;}return false;}
    dash(){const p=this.player;if(this.status!=='running'||p.dashCooldown>0)return false;p.dash=.22;p.invincible=.65;const run=this.team.find(t=>t.id==='running');p.dashCooldown=Math.max(1.2,(run?3-run.level*.4:3.3)-.2*(this.skills.megaphone||0));this.blast(p.x,p.y,85,18,'#ffe79d','✦',.2);this.emit('dash');return true;}
    shuffle(items){const out=items.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
    makeSkillChoices(){const normal=BRANCHES.map(b=>{const available=SKILLS.filter(s=>s.branch===b.id&&(this.skills[s.id]||0)<3);if(!available.length)return{id:'heal',kind:'buff',name:'榆中热奶茶',icon:'🧋',desc:'恢复 50% 最大电量。',branch:b.id};const pick=this.shuffle(available)[0];return{...pick,kind:'skill',nextLevel:(this.skills[pick.id]||0)+1};});const gold=this.shuffle(this.evolutionChoices()).slice(0,2);const base=gold.length?[...this.shuffle(normal.filter(o=>o.kind==='skill')),...this.shuffle(normal.filter(o=>o.kind!=='skill'))]:normal;return [...gold,...base].slice(0,3);}
    makeChoices(preferred){const canAdd=this.team.length<3;const fresh=TYPES.filter(t=>!this.team.some(c=>c.id===t.id)&&(preferred?preferred.includes(t.id):true));const up=this.team.filter(t=>t.level<3).map(t=>TYPE_MAP[t.id]);const option=t=>({id:t.id,kind:'buddy',...t,nextLevel:(this.team.find(x=>x.id===t.id)?.level||0)+1});let options=[];if(canAdd&&fresh.length)options.push(option(this.shuffle(fresh)[0]));const other=TYPES.filter(t=>!options.some(o=>o.id===t.id)&&(this.team.some(c=>c.id===t.id&&c.level<3)||(canAdd&&!this.team.some(c=>c.id===t.id))));options.push(...this.shuffle(other).slice(0,2).map(option));const buffs=[{id:'power',kind:'buff',name:'底气十足',icon:'✨',skill:'全队强化',desc:'全队伤害 +18%，拒绝无效社交。'},{id:'magnet',kind:'buff',name:'人缘吸铁石',icon:'🧲',skill:'收集强化',desc:'吸星距离 +45，默契自己找上门。'},{id:'haste',kind:'buff',name:'说走就走',icon:'⚡',skill:'全队强化',desc:'攻击速度 +13%，行动派集合。'},{id:'heal',kind:'buff',name:'榆中热奶茶',icon:'🧋',skill:'立即补给',desc:'立即恢复 50% 的最大社交电量。'}];if(options.length===3&&this.team.length>=3&&this.random()<.3)options[2]=this.shuffle(buffs)[0];while(options.length<3)options.push(this.shuffle(buffs.filter(b=>!options.some(o=>o.id===b.id)))[0]);return options;}
    offer(reason,preferred){if(this.status!=='running')return;this.status='upgrade';this.options=preferred?this.makeChoices(preferred):this.makeSkillChoices();this.offerReason=reason;this.emit('upgrade',{reason,options:this.options});}
    choose(index){if(this.status!=='upgrade'||!Number.isInteger(index)||!this.options[index])throw new Error('当前没有这个选项');const o=this.options[index];if(o.kind==='evolution')this.evolve(o.id);else if(o.kind==='buddy')this.recruit(o.id);else if(o.kind==='skill'){this.grantSkill(o.id);this.upgradeCooldown=Math.max(12,this.upgradeCooldown);}else if(o.id==='heal')this.player.hp=Math.min(this.player.maxHp,this.player.hp+this.player.maxHp*.5);else this.buffs[o.id]++;this.options=[];this.status='running';this.player.invincible=1.5;this.meetingCooldown=3;this.emit('chosen',{name:o.name});return o;}
    gainXp(value){this.xp+=value;if(this.xp>=this.need&&this.status==='running'&&this.upgradeCooldown<=0){this.xp-=this.need;this.level++;this.need=xpThreshold(this.level);this.upgradeCooldown=12;this.player.hp=Math.min(this.player.maxHp,this.player.hp+5);this.offer('默契升级 · LV. '+this.level);}}
    enemy(boss=false){const angle=this.random()*Math.PI*2,radius=410+this.random()*100,p=this.player,t=this.time,stage=this.stage;const roster=stage.roster.slice(0,Math.min(stage.roster.length,3+this.stageIndex+Math.floor(t/45)));const ri=boss?stage.boss:roster[Math.floor(this.random()*roster.length)],rival=RIVALS[ri];const hp=boss?800+this.stageIndex*550:(ri===2?60+t*.15:ri===5?46+t*.2:28+t*.08)*stage.hp;const e={id:this.nextId++,type:boss?'boss':'rival',roster:ri,name:rival.name,x:clamp(p.x+Math.cos(angle)*radius,45,this.width-45),y:clamp(p.y+Math.sin(angle)*radius,80,this.height-45),hp,maxHp:hp,r:boss?37:ri===2||ri===5?20:16,speed:(boss?(ri===6?64:43):ri===6?90:ri===2?33:ri===5?40:48+t*.065)*stage.speed,damage:boss?14+this.stageIndex:6+this.stageIndex,hit:0,slow:0,stun:0,boost:0,attackClock:1.5+this.random()*2,phase:this.random()*6.28};this.enemies.push(e);return e;}
    hostileShot(e,angle,speed=132){if(this.enemyShots.length>=120)return;this.enemyShots.push({x:e.x,y:e.y-14,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:7,life:5.5,color:RIVALS[e.roster].color,damage:e.type==='boss'?10:6});}
    rivalAttack(e,dt){e.attackClock-=dt;e.boost=Math.max(0,e.boost-dt);if(e.attackClock>0||e.stun>0)return;const target=this.targetFor(e),a=Math.atan2(target.y-e.y,target.x-e.x);if(e.type==='boss'){if(e.roster===1){e.boost=.85;for(let j=-1;j<=1;j++)this.hostileShot(e,a+j*.3,125);e.attackClock=3.8;}else if(e.roster===6){e.boost=.5;for(let j=0;j<8;j++)this.hostileShot(e,j*Math.PI/4+this.time*.4,112);e.attackClock=3.2;}else{for(let j=0;j<12;j++)this.hostileShot(e,j*Math.PI/6+this.time*.3,118);e.attackClock=2.8;}}else if(e.roster===0){for(let j=-1;j<=1;j++)this.hostileShot(e,a+j*.28,112);e.attackClock=4.6;}else if(e.roster===1){e.boost=.7;e.attackClock=4.3;}else if(e.roster===3){this.hostileShot(e,a,190);e.attackClock=3.2;}else if(e.roster===4){for(let j=0;j<6;j++)this.hostileShot(e,a+j*Math.PI/3,105);e.attackClock=5.7;}else if(e.roster===7){for(let j=-1;j<=1;j++)this.hostileShot(e,a+j*.19,142);e.attackClock=4;}else e.attackClock=5;}
    takeDamage(amount){const p=this.player;if(p.invincible>0)return;if(this.shield>0){this.shield--;this.emit('shield');}else{p.hp-=amount;this.emit('hurt');}p.invincible=.85;if(p.hp<=0){p.hp=0;this.finish(false);}}
    hit(enemy,damage,kx=0,ky=0){if(enemy.hp<=0)return;const amount=damage*this.power;enemy.hp-=amount;enemy.hit=.12;enemy.x=clamp(enemy.x+kx,25,this.width-25);enemy.y=clamp(enemy.y+ky,35,this.height-25);if(this.effects.length<130)this.effects.push({kind:'text',x:enemy.x,y:enemy.y-15,text:String(Math.round(amount)),color:enemy.type==='boss'?'#ffdc64':'#fffced',life:.6,maxLife:.6});if(enemy.hp<=0){this.kills++;const val=enemy.type==='boss'?20:enemy.roster===2||enemy.roster===5?2:1;this.gems.push({x:enemy.x,y:enemy.y,val,r:val>3?11:6});this.effects.push({kind:'burst',x:enemy.x,y:enemy.y,color:enemy.type==='boss'?'#ffdb59':'#fffde2',life:.4,maxLife:.4,r:enemy.r});if(enemy.type==='boss'){this.bossKilled=true;this.bossesKilled++;this.player.hp=Math.min(this.player.maxHp,this.player.hp+30);this.emit('boss-defeated');}if(this.random()<.05)this.gems.push({x:enemy.x+12,y:enemy.y,val:0,heal:9,r:8});}}
    nearest(x,y){let best=null,d=Infinity;for(const e of this.enemies){const v=Math.hypot(e.x-x,e.y-y);if(e.hp>0&&v<d){d=v;best=e;}}return best;}
    projectile(x,y,target,damage,icon,color,{spread=0,speed=420,pierce=1,size=12}={}){if(!target)return;const a=Math.atan2(target.y-y,target.x-x)+spread;const shot={x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,damage,icon,color,pierce,r:size,life:2.2,hitIds:new Set(),rotation:a};this.shots.push(shot);return shot;}
    blast(x,y,r,damage,color,icon,stun=0,slow=0){this.effects.push({kind:'ring',x,y,r,color,icon,life:.45,maxLife:.45});for(const e of this.enemies){const d=Math.hypot(e.x-x,e.y-y);if(e.hp>0&&d<r+e.r){this.hit(e,damage,(e.x-x)/(d||1)*18,(e.y-y)/(d||1)*18);e.stun=Math.max(e.stun,stun);e.slow=Math.max(e.slow,slow);}}}
    companionPosition(index){const a=this.time*.3+index*Math.PI*2/Math.max(this.team.length,1);return{x:this.player.x+Math.cos(a)*58,y:this.player.y+Math.sin(a)*38};}
    attack(c,index){const def=TYPE_MAP[c.id],p=this.player,pos=this.companionPosition(index),lv=c.level,target=this.nearest(pos.x,pos.y);switch({future:'study',jade:'chat',yiting:'badminton'}[c.id]||c.id){case 'study':this.projectile(pos.x,pos.y,target,20+lv*9,'✨',def.color,{pierce:2+lv,size:14});break;case 'board':this.projectile(pos.x,pos.y,target,(9+lv*4)*(2+Math.floor(this.random()*5)),'🎲',def.color,{speed:330,size:17});break;case 'mahjong':for(let i=-1;i<=1;i++)this.projectile(pos.x,pos.y,target,17+lv*8,'🀄',def.color,{spread:i*.21,pierce:lv+1,size:14});break;case 'mystery':if(target){const e=this.enemies.filter(e=>e.hp>0).sort((a,b)=>b.hp-a.hp)[0];if(e)this.blast(e.x,e.y,78+lv*12,35+lv*15,def.color,'🎭',.8);}break;case 'fitness':this.blast(p.x,p.y,116+lv*20,28+lv*14,def.color,'💪',.2);break;case 'running':this.projectile(pos.x,pos.y,target,20+lv*11,'👟',def.color,{speed:510,pierce:2,size:14});break;case 'hiking':this.blast(p.x,p.y,135+lv*23,18+lv*11,def.color,'🍃',.3);break;case 'swimming':this.blast(p.x,p.y,142+lv*25,25+lv*8,def.color,'💧',0,2);break;case 'badminton':this.projectile(pos.x,pos.y,target,19+lv*10,'🌟',def.color,{speed:560,pierce:2+lv,size:15});if(lv>=3)this.projectile(pos.x,pos.y,target,20,'🌟',def.color,{spread:.19,pierce:2});break;case 'chat':this.blast(p.x,p.y,108+lv*26,16+lv*9,def.color,'💚',.2);p.hp=Math.min(p.maxHp,p.hp+2+lv);break;}}
    step(dt,input={x:0,y:0}){if(this.status!=='running')return;dt=clamp(dt,0,.05);const p=this.player;this.time+=dt;const phase=this.time>=this.stage.bossAt?3:Math.min(2,Math.floor(this.time/50));if(phase!==this.phase){this.phase=phase;this.emit('phase',{phase});}if(this.time>=this.duration){this.finish(true);return;}p.invincible=Math.max(0,p.invincible-dt);p.dashCooldown=Math.max(0,p.dashCooldown-dt);p.dash=Math.max(0,p.dash-dt);this.meetingCooldown=Math.max(0,this.meetingCooldown-dt);this.upgradeCooldown=Math.max(0,this.upgradeCooldown-dt);this.tickChallenge(dt);let ix=Number.isFinite(input.x)?input.x:0,iy=Number.isFinite(input.y)?input.y:0;const len=Math.hypot(ix,iy);if(len>0){ix/=Math.max(1,len);iy/=Math.max(1,len);p.dx=ix;p.dy=iy;}const runner=this.team.find(c=>c.id==='running');const speed=192*(runner?1+.15*runner.level:1)*(1+.12*(this.skills.megaphone||0));if(p.dash>0){ix=p.dx*3.1;iy=p.dy*3.1;}this.moving=Math.hypot(ix,iy)>.05;this.movePlayer(ix*speed*dt,iy*speed*dt);if(this.synergies.some(s=>s.id==='heal'))p.hp=Math.min(p.maxHp,p.hp+dt);if(this.skills.recharge)p.hp=Math.min(p.maxHp,p.hp+dt*.8*this.skills.recharge);this.tickSkills(dt);this.tickEvolutionZones(dt);this.spawnClock-=dt;if(this.spawnClock<=0){const count=1+Math.floor(this.time/75)+(this.stageIndex===2&&this.time>100?1:0);for(let k=0;k<count&&this.enemies.length<90;k++)this.enemy();this.spawnClock=Math.max(.55,this.stage.spawn-this.time*.0035);}if(this.time>=this.stage.bossAt&&!this.bossSpawned){this.bossSpawned=true;this.enemy(true);this.emit('boss');}this.heroClock-=dt;if(this.heroClock<=0){this.projectile(p.x,p.y-16,this.nearest(p.x,p.y),17+this.level*1.7,'✦','#f4cc55',{speed:490,pierce:1+Math.floor(this.level/5),size:10});this.heroClock=.52/this.haste;}for(let i=0;i<this.team.length;i++){const c=this.team[i];c.clock-=dt;if(c.clock<=0){this.attack(c,i);c.clock=TYPE_MAP[c.id].cd/(this.haste*(1+(c.level-1)*.1));}}
      for(const e of this.enemies){if(e.hp<=0)continue;e.hit=Math.max(0,e.hit-dt);e.stun=Math.max(0,e.stun-dt);e.slow=Math.max(0,e.slow-dt);this.rivalAttack(e,dt);const target=this.targetFor(e),d=dist(e,target);if(d>1&&e.stun<=0){const speed=e.speed*(e.slow>0?.45:1)*(e.boost>0?2.7:1)*dt;e.x+=(target.x-e.x)/d*speed;e.y+=(target.y-e.y)/d*speed;}if(d<e.r+target.r&&target.invincible<=0){this.damagePlayer(target,e.damage);this.effects.push({kind:'ring',x:target.x,y:target.y,r:45,color:'#d77368',life:.25,maxLife:.25});if(this.status==='lost')return;}}
      for(const b of this.enemyShots){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life>0)for(const target of this.activePlayers()){if(Math.hypot(b.x-target.x,b.y-target.y)<b.r+target.r){this.damagePlayer(target,b.damage);b.life=0;if(this.status==='lost')return;break;}}}this.enemyShots=this.enemyShots.filter(b=>b.life>0&&b.x>0&&b.y>0&&b.x<this.width&&b.y<this.height);
      for(const s of this.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.life<=0)continue;for(const e of this.enemies){if(e.hp>0&&!s.hitIds.has(e.id)&&Math.hypot(s.x-e.x,s.y-e.y)<s.r+e.r){s.hitIds.add(e.id);this.hit(e,s.damage,s.vx/100,s.vy/100);s.pierce--;if(s.pierce<=0){s.life=0;break;}}}}
      const hike=this.team.find(t=>t.id==='hiking');const magnet=92+this.buffs.magnet*45+(hike?hike.level*45:0)+(this.synergies.some(s=>s.id==='magnet')?70:0);let xp=0;for(const g of this.gems){const target=this.targetFor(g),d=dist(g,target);if(d<magnet){const pull=Math.max(300,550-d*1.2)*dt;g.x+=(target.x-g.x)/(d||1)*Math.min(pull,d);g.y+=(target.y-g.y)/(d||1)*Math.min(pull,d);}if(d<23){g.collected=true;if(g.heal){p.hp=Math.min(p.maxHp,p.hp+g.heal);this.emit('heal');}else xp+=g.val;}}
      this.enemies=this.enemies.filter(e=>e.hp>0);this.shots=this.shots.filter(s=>s.life>0&&s.x>-50&&s.y>-50&&s.x<this.width+50&&s.y<this.height+50);this.gems=this.gems.filter(g=>!g.collected);if(this.gems.length>350){const a=this.gems.shift();this.gems[0].val+=a.val;}for(const e of this.effects){e.life-=dt;if(e.kind==='text')e.y-=25*dt;}this.effects=this.effects.filter(e=>e.life>0).slice(-160);this.completeChallenge();if(xp)this.gainXp(xp);else if(this.xp>=this.need)this.gainXp(0);this.checkLandmarks();if(this.status==='running'&&this.meetingCooldown<=0)for(const m of this.meetups){if(!m.used&&this.activePlayers().some(p=>dist(m,p)<48)){m.used=true;this.offer(m.name,m.pool);break;}}
    }
    movePlayer(dx,dy){const p=this.player;const blocked=(x,y)=>WALLS.some(([a,b,w,h])=>x>a-p.r&&x<a+w+p.r&&y>b-p.r&&y<b+h+p.r);const nx=clamp(p.x+dx,40,this.width-40),ny=clamp(p.y+dy,95,this.height-40);if(!blocked(nx,p.y))p.x=nx;if(!blocked(p.x,ny))p.y=ny;}
    tickSkills(dt){const p=this.player;this.frenzy=Math.max(0,this.frenzy-dt);this.clones=Math.max(0,this.clones-dt);if(this.frenzy>0)for(const e of this.enemies)if(dist(e,p)<260)e.slow=Math.max(e.slow,.15);if(this.clones>0){this.cloneClock-=dt;if(this.cloneClock<=0){for(const sign of[-1,1])this.projectile(p.x+sign*78,p.y-18,this.nearest(p.x,p.y),16+10*(this.skills.random||1),'✦','#efabd4',{speed:520,pierce:2,size:11});this.cloneClock=.35;}}
      for(const id of ['quilt','domain','megaphone','random','overload','sprint','combo']){const lv=this.skills[id];if(!lv)continue;this.skillClock[id]-=dt;if(this.skillClock[id]>0)continue;switch(id){
        case'quilt':this.shield=Math.max(this.shield,Math.min(lv,3));this.skillClock[id]=Math.max(5,10-lv);break;
        case'domain':this.projectile(p.x,p.y-28,this.nearest(p.x,p.y),8+lv*7,'⚡','#9ee6d0',{speed:620,pierce:1+Math.floor(lv/2),size:10});this.skillClock[id]=.22;break;
        case'megaphone':if(!this.moving)break;this.blast(p.x,p.y,155+lv*42,23+lv*15,'#e9a1d0','📣',.7);this.effects.push({kind:'text',x:p.x,y:p.y-95,text:'救命！',color:'#ffdef2',life:1,maxLife:1});this.skillClock[id]=3;this.emit('burst',{name:'边竞走边喊救命！'});break;
        case'random':this.clones=3+lv;this.cloneClock=0;this.skillClock[id]=7;this.emit('burst',{name:'狗男女制作一次'});break;
        case'overload':this.frenzy=4;this.skillClock[id]=12;this.emit('burst',{name:'很思虑 · 思维爆发'});break;
        case'sprint':{const card=this.cardIndex++%3;let label;if(card===0){this.cardPower=Math.min(.9,this.cardPower+.08*lv);label='力量牌 · 伤害提升';}else if(card===1){this.shield=Math.min(3,this.shield+1);label='防御牌 · 获得护盾';}else{p.hp=Math.min(p.maxHp,p.hp+10*lv);label='治疗牌 · 恢复电量';}this.effects.push({kind:'text',x:p.x,y:p.y-92,text:label,color:'#ffe6a6',life:1.2,maxLife:1.2});this.skillClock[id]=6;break;}
        case'combo':for(let i=-1;i<=1;i++)this.projectile(p.x,p.y-18,this.nearest(p.x,p.y),16+lv*9,'🀄','#f2d977',{spread:i*.2,pierce:2,size:13});this.skillClock[id]=1.8;break;
      }}
      this.tickEvolutions(dt);
    }
    finish(win){if(this.status!=='running')return;if(win){this.time=this.duration;this.completedStages.push({name:this.stage.name,kills:this.kills-this.stageStartKills,bossDefeated:this.bossKilled});}if(win&&this.stageIndex<STAGES.length-1){this.status='stage-clear';this.emit('stage-clear');}else{this.status=win?'won':'lost';this.emit('end',{win,score:this.score});}}
    get score(){return Math.round(this.kills*10+this.team.length*180+this.level*50+this.elapsed*4+this.landmarkBonus+this.completedStages.length*400+(this.status==='won'?1000:0)+this.bossesKilled*600);}
    snapshot(){return{status:this.status,world:{width:this.width,height:this.height},position:{x:Math.round(this.player.x),y:Math.round(this.player.y)},stage:this.stageIndex+1,stageName:this.stage.name,stageCount:STAGES.length,elapsed:Math.floor(this.elapsed),experience:this.xp,nextLevelExperience:this.need,completedStages:this.completedStages.slice(),seconds:Math.round(this.time),remaining:Math.ceil(this.duration-this.time),level:this.level,hp:Math.round(this.player.hp),maxHp:this.player.maxHp,kills:this.kills,score:this.score,team:this.team.map(c=>({id:c.id,name:TYPE_MAP[c.id].name,level:c.level})),choices:this.options.map((o,i)=>({index:i+1,id:o.id,name:o.name,description:o.desc})),skills:Object.entries(this.skills).map(([id,level])=>({id,name:SKILL_MAP[id].name,branch:SKILL_MAP[id].branch,level})),evolutions:this.evolutions.map(id=>({id,name:api.EVOLUTION_MAP[id].name})),evolutionRecipes:api.EVOLUTIONS.map(e=>this.evolutionProgress(e.id)),shield:this.shield,bossDefeated:this.bossKilled,landmarks:this.landmarks.map(m=>({id:m.id,name:m.name,state:m.state,x:m.x,y:m.y})),landmarkBonus:this.landmarkBonus,currentLandmark:this.currentLandmark?{name:this.currentLandmark.name,choices:this.landmarkOptions.map((o,i)=>({index:i+1,name:o.name,description:o.desc}))}:null,challenge:this.challenge?{remaining:Math.ceil(this.challenge.remaining),duration:this.challenge.duration}:null};}
  }
  const api={Game,TYPES,TYPE_MAP,RIVALS,BRANCHES,SKILLS,SKILL_MAP,LANDMARKS,STAGES,xpThreshold,MAP_SCALE,WORLD,WALLS,MAP_LABELS,cameraFrame,clamp};if(typeof module!=='undefined'&&module.exports){module.exports=api;require('./evolutions.js').install(api);}root.FengdouEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
