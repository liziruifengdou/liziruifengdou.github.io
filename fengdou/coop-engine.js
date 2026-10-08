(function(root){
  'use strict';
  const E=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.FengdouEngine;
  const {Game,STAGES,clamp}=E;
  const COLORS=['#ffda65','#83d6ec','#f5a5c7','#bfa4ef','#94df9b','#ffae79','#89d7c9','#c4cefa'];
  const COMBAT=['heroClock','skillClock','frenzy','clones','cloneClock','cardIndex','cardPower','moving','evolutionCombat'];
  const combat=()=>({heroClock:.2,skillClock:{quilt:0,domain:0,megaphone:0,random:0,overload:0,sprint:0,combo:0},frenzy:0,clones:0,cloneClock:0,cardIndex:0,cardPower:0,moving:false,evolutionCombat:{clocks:{},burst:null}});
  class CoopGame extends Game{
    reset(){super.reset();this.humans=[];this.coop=false;this.runId=null;this.coopSpawnClock=1;return this;}
    startCoop(roster,hostId,starter='future'){
      if(!Array.isArray(roster)||roster.length<1||roster.length>8)throw new Error('需要 1 至 8 位玩家');
      const host=roster.find(m=>m.id===hostId);if(!host)throw new Error('没有找到房主');
      super.start(starter);this.coop=true;this.runId=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);
      const sorted=[host,...roster.filter(m=>m.id!==hostId)];
      this.player.maxHp=this.player.hp=100+40*(roster.length-1);
      this.humans=sorted.map((m,i)=>{
        const p=i===0?this.player:{...this.player,combat:combat()};
        Object.assign(p,{id:m.id,name:m.name,slot:m.slot,color:COLORS[m.slot%8],connected:true,dashSeq:0});
        if(i){p.x+=((i%4)-1.5)*44;p.y+=Math.floor(i/4)*48+44;}
        return p;
      });
      this.emit('coop-start');return this.snapshot();
    }
    activePlayers(){return this.coop?this.humans.filter(p=>p.connected):super.activePlayers();}
    targetFor(entity){const list=this.activePlayers();return list.reduce((a,b)=>Math.hypot(a.x-entity.x,a.y-entity.y)<Math.hypot(b.x-entity.x,b.y-entity.y)?a:b,list[0]||this.player);}
    updateStats(){if(this.coop)this.player.maxHp=100+40*(this.humans.length-1);else super.updateStats();}
    setRoster(members){for(const p of this.humans){const m=members.find(m=>m.id===p.id);p.connected=p===this.player||!!m?.online;}}
    withHuman(p,fn){
      if(p===this.player)return fn();
      const primary=this.player,saved={};
      p.hp=primary.hp;p.maxHp=primary.maxHp;p.combat??=combat();p.combat.evolutionCombat??={clocks:{},burst:null};
      for(const key of COMBAT){saved[key]=this[key];this[key]=p.combat[key];}
      this.player=p;
      try{return fn();}finally{primary.hp=p.hp;this.player=primary;for(const key of COMBAT){p.combat[key]=this[key];this[key]=saved[key];}}
    }
    damagePlayer(p,amount){if(!this.coop)return super.damagePlayer(p,amount);return this.withHuman(p,()=>super.takeDamage(amount));}
    dashHuman(id){const p=this.humans.find(p=>p.id===id&&p.connected);return p?this.withHuman(p,()=>super.dash()):false;}
    enemy(boss=false){
      if(!this.coop)return super.enemy(boss);
      const players=this.activePlayers(),p=players[Math.floor(this.random()*players.length)]||this.player;
      const e=this.withHuman(p,()=>super.enemy(boss));
      e.hp=e.maxHp=Math.round(e.maxHp*(1+.42*(players.length-1)));return e;
    }
    gainXp(value){super.gainXp(this.coop?value/(1+.35*(this.humans.length-1)):value);}
    stepHuman(p,dt,input){
      this.withHuman(p,()=>{
        p.invincible=Math.max(0,p.invincible-dt);p.dashCooldown=Math.max(0,p.dashCooldown-dt);p.dash=Math.max(0,p.dash-dt);
        let x=input.x||0,y=input.y||0;const len=Math.max(1,Math.hypot(x,y));x/=len;y/=len;
        if(Math.hypot(x,y)>.01){p.dx=x;p.dy=y;}if(p.dash>0){x=p.dx*3.1;y=p.dy*3.1;}
        this.moving=Math.hypot(x,y)>.05;
        this.movePlayer(x*192*(1+.12*(this.skills.megaphone||0))*dt,y*192*(1+.12*(this.skills.megaphone||0))*dt);
        p.hp=Math.min(p.maxHp,p.hp+dt*((this.synergies.some(s=>s.id==='heal')?1:0)+.8*(this.skills.recharge||0)));
        this.tickSkills(dt);this.heroClock-=dt;
        if(this.heroClock<=0){this.projectile(p.x,p.y-16,this.nearest(p.x,p.y),17+this.level*1.7,'✦',p.color,{speed:490,pierce:1+Math.floor(this.level/5),size:10});this.heroClock=.52/this.haste;}
      });
    }
    step(dt,input={x:0,y:0},remoteInputs={}){
      if(!this.coop)return super.step(dt,input);
      if(this.status!=='running')return;
      dt=clamp(dt,0,.05);
      for(const p of this.humans){
        let controls=p===this.player?input:(remoteInputs[p.id]||{x:0,y:0,dash:p.dashSeq});
        if(controls.runId&&controls.runId!==this.runId)controls={x:0,y:0,dash:p.dashSeq};
        if(!p.connected)continue;
        if((controls.dash||0)>p.dashSeq){p.dashSeq=controls.dash;this.dashHuman(p.id);}
        if(p!==this.player)this.stepHuman(p,dt,controls);
      }
      super.step(dt,input);
      if(this.status==='running'){
        this.coopSpawnClock-=dt;
        if(this.coopSpawnClock<=0){for(let i=0;i<Math.floor((this.activePlayers().length-1)/2)&&this.enemies.length<120;i++)this.enemy();this.coopSpawnClock=Math.max(.8,2.2-this.time*.004);}
      }
      this.shots=this.shots.slice(-450);
      for(const p of this.humans){p.hp=this.player.hp;p.maxHp=this.player.maxHp;}
    }
    nextStage(){const result=super.nextStage();if(this.coop){this.humans.forEach((p,i)=>{if(i){p.x=this.player.x+((i%4)-1.5)*44;p.y=this.player.y+Math.floor(i/4)*48+44;p.invincible=3;p.dash=p.dashCooldown=0;if(p.combat?.evolutionCombat)p.combat.evolutionCombat.burst=null;}p.hp=this.player.hp;});}return result;}
    toWire(){
      const data={protocol:1};
      for(const [key,value]of Object.entries(this))if(!['random','events'].includes(key))data[key]=value;
      return JSON.parse(JSON.stringify(data,(_,v)=>v instanceof Set?[...v]:typeof v==='number'?Math.round(v*1000)/1000:v));
    }
    fromWire(state){
      if(!state||state.protocol!==1)throw new Error('游戏版本不同，请刷新后重新加入');
      // Only accept the known engine fields; never copy methods or prototypes from a peer.
      for(const key of Object.keys(this))if(!['random','events'].includes(key)&&Object.hasOwn(state,key))this[key]=state[key];
      this.events=[];
      this.player=this.humans.find(p=>p.id===state.player.id)||this.humans[0];
      for(const s of this.shots)s.hitIds=new Set(s.hitIds||[]);
      if(this.currentLandmark)this.currentLandmark=this.landmarks.find(m=>m.id===this.currentLandmark.id)||null;
      return this;
    }
    snapshot(){return {...super.snapshot(),multiplayer:this.coop,players:(this.humans||[]).map(p=>({id:p.id,name:p.name,x:Math.round(p.x),y:Math.round(p.y),online:p.connected}))};}
  }
  E.CoopGame=CoopGame;E.PLAYER_COLORS=COLORS;
  if(typeof module!=='undefined'&&module.exports)module.exports={CoopGame,COLORS};
})(typeof globalThis!=='undefined'?globalThis:this);
