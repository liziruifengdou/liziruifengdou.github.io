(function(root){
  'use strict';
  const skill=(id,level)=>({kind:'skill',id,level});
  const buddy=(id,level)=>({kind:'buddy',id,level});
  const EVOLUTIONS=[
    {id:'eruption',name:'短时间内他把主要的喷发出来了',icon:'☄',color:'#f7aa55',tag:'蓄力爆发 · 扇形弹幕',cooldown:10,requires:[skill('domain',3),skill('recharge',2)],desc:'每 10 秒爆发 2 秒，连续喷出 10 轮五向星焰，每颗可贯穿 4 位对手。'},
    {id:'stride',name:'肤白貌美大长腿',icon:'✧',color:'#e990bc',tag:'双线贯穿 · 远程清场',cooldown:6,requires:[buddy('yiting',3),skill('megaphone',2)],desc:'每 6 秒向最近对手扫出两道 700 距离的星光长线，贯穿沿途全部对手。'},
    {id:'memory',name:'我就小时候被女生亲过',icon:'♥',color:'#ef9bb3',tag:'心形震荡 · 命中回血',cooldown:7,requires:[buddy('jade',3),skill('quilt',2)],desc:'每 7 秒释放心形震荡，击退并短暂眩晕周围对手；命中时恢复 6 点小队电量。'},
    {id:'allies',name:'只要是个人都行啊男的完全可以',icon:'∞',color:'#89d9c7',tag:'彩虹连锁 · 群体压制',cooldown:4.5,requires:[buddy('future',3),skill('random',2)],desc:'每 4.5 秒打出彩虹连锁，最多跳向 6 位不同对手；相邻两跳距离不超过 320。'},
    {id:'treasure',name:'云哥哥浑身都是宝',icon:'✦',color:'#f2d66b',tag:'宝牌风暴 · 攻守一体',cooldown:10,requires:[skill('sprint',3),skill('combo',2)],desc:'每 10 秒展开跟随自身的 3 秒宝牌阵，持续攻击周围对手并发射八向宝牌，同时补充 1 层护盾（最多 3 层）。'},
    {id:'vortex',name:'鬼头大动哦买嘎',icon:'👻',color:'#bca3f2',tag:'幽灵旋涡 · 聚怪消弹',cooldown:12,requires:[skill('overload',3),skill('fundamentals',2)],desc:'每 12 秒在最近对手脚下展开 3 秒旋涡，牵引普通对手、持续伤害并消除范围内敌方弹幕；关底对手只受伤害和减速。'}
  ];
  const EVOLUTION_MAP=Object.fromEntries(EVOLUTIONS.map(e=>[e.id,e]));
  const MAX_EVOLUTIONS=3;
  function install(E){
    const {Game,TYPE_MAP,SKILL_MAP,clamp}=E;
    Object.assign(E,{EVOLUTIONS,EVOLUTION_MAP,MAX_EVOLUTIONS});
    Object.assign(Game.prototype,{
      resetEvolutions(){this.evolutions=[];this.evolutionCombat={clocks:{},burst:null};this.evolutionZones=[];},
      evolutionProgress(id){
        const e=EVOLUTION_MAP[id];
        if(!e)throw new Error('未知进化技能');
        const requirements=e.requires.map(r=>({...r,name:(r.kind==='skill'?SKILL_MAP:TYPE_MAP)[r.id].name,current:r.kind==='skill'?(this.skills[r.id]||0):(this.team.find(c=>c.id===r.id)?.level||0)}));
        const complete=requirements.every(r=>r.current>=r.level);
        const state=this.evolutions.includes(id)?'active':this.evolutions.length>=MAX_EVOLUTIONS?'full':!complete?'growing':this.stageIndex<1?'chapter':'ready';
        return{id,requirements,state,complete};
      },
      evolutionChoices(){return EVOLUTIONS.filter(e=>this.evolutionProgress(e.id).state==='ready').map(e=>({...e,kind:'evolution'}));},
      evolve(id){
        if(this.evolutionProgress(id).state!=='ready')throw new Error('进化配方尚未满足，或本局进化槽位已满');
        this.evolutions.push(id);this.evolutionCombat.clocks[id]=0;
        this.emit('evolution',{id,name:EVOLUTION_MAP[id].name});
      },
      evolutionEffect(effect){if(this.effects.length<125)this.effects.push({...effect,maxLife:effect.life});},
      evolutionShot(id,x,y,target,damage,options={}){
        const e=EVOLUTION_MAP[id],s=this.projectile(x,y,target,damage,e.icon,e.color,options);
        if(s)s.evolution=id;
        return s;
      },
      tickEvolutions(dt){
        const p=this.player,c=this.evolutionCombat;
        for(const id of this.evolutions){
          c.clocks[id]=(c.clocks[id]||0)-dt;
          if(c.clocks[id]>0)continue;
          const target=this.nearest(p.x,p.y);
          if(!target||Math.hypot(target.x-p.x,target.y-p.y)>750){c.clocks[id]=.25;continue;}
          c.clocks[id]=EVOLUTION_MAP[id].cooldown;
          this.castEvolution(id,target);
        }
        if(c.burst){
          const b=c.burst;b.clock-=dt;
          if(b.clock<=0){
            const target=this.nearest(p.x,p.y)||{x:p.x+Math.cos(b.angle)*500,y:p.y+Math.sin(b.angle)*500};
            for(let i=-2;i<=2;i++)this.evolutionShot('eruption',p.x,p.y-20,target,32,{spread:i*.15,speed:650,pierce:4,size:13});
            b.clock+=.2;b.rounds--;
            if(b.rounds<=0)c.burst=null;
          }
        }
      },
      castEvolution(id,target){
        const p=this.player,e=EVOLUTION_MAP[id],angle=Math.atan2(target.y-p.y,target.x-p.x);
        if(id==='eruption'){
          this.evolutionCombat.burst={clock:0,rounds:10,angle};
          this.evolutionEffect({kind:'evo-nova',x:p.x,y:p.y,r:75,color:e.color,icon:e.icon,life:.55});
        }else if(id==='stride'){
          const dx=Math.cos(angle),dy=Math.sin(angle);
          for(const sign of [-1,1]){
            const x=p.x-dy*22*sign,y=p.y+dx*22*sign;
            for(const enemy of this.enemies){
              const along=(enemy.x-x)*dx+(enemy.y-y)*dy,across=Math.abs((enemy.x-x)*dy-(enemy.y-y)*dx);
              if(enemy.hp>0&&along>=-enemy.r&&along<=700+enemy.r&&across<17+enemy.r)this.hit(enemy,100,dx*22,dy*22);
            }
            this.evolutionEffect({kind:'evo-beam',x,y,x2:x+dx*700,y2:y+dy*700,width:22,color:e.color,life:.5});
          }
        }else if(id==='memory'){
          let touched=false;
          for(const enemy of this.enemies){
            const d=Math.hypot(enemy.x-p.x,enemy.y-p.y);
            if(enemy.hp<=0||d>235+enemy.r)continue;
            touched=true;this.hit(enemy,95,(enemy.x-p.x)/(d||1)*35,(enemy.y-p.y)/(d||1)*35);
            enemy.stun=Math.max(enemy.stun,enemy.type==='boss'?.15:.8);
          }
          if(touched)p.hp=Math.min(p.maxHp,p.hp+6);
          this.evolutionEffect({kind:'evo-nova',x:p.x,y:p.y,r:235,color:e.color,icon:e.icon,life:.75});
        }else if(id==='allies'){
          let from={x:p.x,y:p.y};const seen=new Set(),colors=['#8cdecf','#f3d976','#e89bbc','#aaa8f1','#8cdecf','#f3d976'];
          for(let i=0;i<6;i++){
            const next=this.enemies.filter(n=>n.hp>0&&!seen.has(n.id)&&Math.hypot(n.x-from.x,n.y-from.y)<(i?320:750)).sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y))[0];
            if(!next)break;seen.add(next.id);
            const point={x:next.x,y:next.y};this.hit(next,80);
            this.evolutionEffect({kind:'evo-beam',x:from.x,y:from.y,x2:point.x,y2:point.y,width:8,color:colors[i],life:.55});from=point;
          }
        }else if(id==='treasure'){
          this.shield=Math.min(3,this.shield+1);
          for(let i=0;i<8;i++)this.evolutionShot(id,p.x,p.y,{x:p.x+Math.cos(angle+i*Math.PI/4)*400,y:p.y+Math.sin(angle+i*Math.PI/4)*400},55,{speed:360,pierce:6,size:16});
          this.evolutionZones.push({kind:id,owner:p.id||'solo',x:p.x,y:p.y,r:170,life:3,maxLife:3,clock:0});
        }else if(id==='vortex'){
          this.evolutionZones.push({kind:id,owner:p.id||'solo',x:target.x,y:target.y,r:190,life:3,maxLife:3,clock:0});
        }
      },
      tickEvolutionZones(dt){
        // Tick once per world frame, including in co-op; never once per human.
        for(const z of this.evolutionZones){
          z.life-=dt;if(z.life<=0)continue;
          if(z.kind==='treasure'){
            const owner=this.activePlayers().find(p=>(p.id||'solo')===z.owner);
            if(!owner){z.life=0;continue;}z.x=owner.x;z.y=owner.y;
          }
          z.clock-=dt;const damageTick=z.clock<=0;if(damageTick)z.clock+=.4;
          for(const enemy of this.enemies){
            const d=Math.hypot(enemy.x-z.x,enemy.y-z.y);if(enemy.hp<=0||d>z.r+enemy.r)continue;
            if(z.kind==='vortex'){
              enemy.slow=Math.max(enemy.slow,.3);
              if(enemy.type!=='boss'&&d>8){const pull=Math.min(d-8,95*dt);enemy.x=clamp(enemy.x+(z.x-enemy.x)/d*pull,25,this.width-25);enemy.y=clamp(enemy.y+(z.y-enemy.y)/d*pull,35,this.height-25);}
            }
            if(damageTick)this.hit(enemy,z.kind==='vortex'?36:30);
          }
          if(z.kind==='vortex')for(const shot of this.enemyShots)if(Math.hypot(shot.x-z.x,shot.y-z.y)<z.r)shot.life=0;
        }
        this.evolutionZones=this.evolutionZones.filter(z=>z.life>0).slice(-24);
      }
    });
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={install};
  else install(root.FengdouEngine);
})(typeof globalThis!=='undefined'?globalThis:this);
