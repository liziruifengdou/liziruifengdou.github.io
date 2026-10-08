(function(root){
  'use strict';
  const roomEndpoint=root.document?.querySelector('meta[name="fengdou-room-endpoint"]')?.content||'/api/room';
  class RoomClient{
    constructor({onRoom,onError,getState,getInput}){Object.assign(this,{onRoom,onError,getState,getInput});this.room=null;this.id=null;this.token=null;this.timer=null;this.closed=false;this.busy=false;this.inputSeq=0;this.revision=0;this.latency=0;this.lastGood=0;this.failures=0;this.generation=0;}
    get isHost(){return !!this.room&&this.room.hostId===this.id;}
    get healthy(){return performance.now()-this.lastGood<4500;}
    async request(payload){
      const began=performance.now();
      const response=await fetch(roomEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',cache:'no-store',body:JSON.stringify(payload),signal:AbortSignal.timeout(8000)});
      let data;try{data=await response.json();}catch{throw new Error('联机服务暂时没有回应，请稍后重试。');}
      if(!response.ok)throw Object.assign(new Error(data.error||'没有连接成功，请再试一次。'),{status:response.status});
      this.latency=Math.round(performance.now()-began);this.lastGood=performance.now();this.failures=0;return data;
    }
    credentials(){return {code:this.room?.code,id:this.id,token:this.token};}
    save(){try{sessionStorage.setItem('fengdou-room-session',JSON.stringify({...this.credentials(),inputSeq:this.inputSeq,revision:this.revision}));}catch{}}
    static saved(){try{return JSON.parse(sessionStorage.getItem('fengdou-room-session'));}catch{return null;}}
    async connect(action,name,code){const data=await this.request({action,name,code});this.id=data.id;this.token=data.token;this.receive(data.room);this.save();this.schedule(800);return this.room;}
    async resume(saved){this.id=saved.id;this.token=saved.token;this.inputSeq=(saved.inputSeq||0)+100;const data=await this.request({action:'resume',...saved,inputSeq:this.inputSeq,input:{x:0,y:0}});this.receive(data.room,true);this.save();this.schedule(500);return this.room;}
    receive(room,resumed=false){this.room=room;this.receivedAt=performance.now();this.revision=Math.max(this.revision,room.revision);this.onRoom?.(room,resumed);}
    age(timestamp){return (this.room?.serverNow||0)-timestamp+performance.now()-(this.receivedAt||0);}
    schedule(delay){clearTimeout(this.timer);if(!this.closed)this.timer=setTimeout(()=>this.sync(),delay);}
    async sync(){
      if(this.closed||this.busy)return;
      this.busy=true;const generation=this.generation;
      try{
        const payload={action:'sync',...this.credentials(),inputSeq:++this.inputSeq,input:this.getInput?.()||{x:0,y:0},revision:this.revision};
        if(this.isHost&&this.room.phase==='playing'){payload.state=this.getState();payload.revision=++this.revision;}
        const data=await this.request(payload);if(this.closed||generation!==this.generation)return;
        this.receive(data.room);this.save();
      }catch(error){if(this.closed||generation!==this.generation)return;this.failures++;this.onError?.(error,[401,404,410].includes(error.status));}
      finally{this.busy=false;if(!this.closed&&generation===this.generation)this.schedule(this.failures?Math.min(3000,500*this.failures):this.room?.phase==='playing'?120:850);}
    }
    async start(state){
      // Do not overlap a state-changing start with the ordinary polling request.
      clearTimeout(this.timer);while(this.busy)await new Promise(resolve=>setTimeout(resolve,25));this.busy=true;
      try{const data=await this.request({action:'start',...this.credentials(),state});this.receive(data.room);this.save();}
      catch(error){
        // A timed-out request may already have started the room. Recover that result.
        if(!error.status||error.status>=500){const data=await this.request({action:'resume',...this.credentials()});if(data.room.phase==='playing'&&data.room.state){this.receive(data.room,true);this.save();return;}}
        throw error;
      }
      finally{this.busy=false;this.schedule(120);}
    }
    async leave(){this.closed=true;this.generation++;clearTimeout(this.timer);try{sessionStorage.removeItem('fengdou-room-session');}catch{}if(this.room)try{await this.request({action:'leave',...this.credentials()});}catch{}}
    stop(){this.closed=true;this.generation++;clearTimeout(this.timer);}
  }
  root.FengdouNetwork={RoomClient};
})(globalThis);
