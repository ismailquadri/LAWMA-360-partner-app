import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
// Partner side of the customer-app/src/service-sync.ts protocol. Same API and
// Bearer session code; instead of patching state, the partner reads the live
// document and sends commands (accept / schedule / decline / reply) that the
// service applies to the customer's record.
const API='https://vercel-release-eight.vercel.app/api/service';
export type SharedState={premiseId:string;partnerId:string;providerChangeId:string;capacityRequest:number;bins:{id:string;size:number;state:string}[];balance:number;reserved:number;pickups:{id:string;status:string;amount:number;created:string;window:string;partner:string;evidence?:string}[];entries:{id:string;title:string;amount:number;time:string;kind:string}[];issues:{id:string;type:string;detail:string;status:string;time:string;reply?:string}[];notices:string[];requestBinOnMove:boolean;archives:unknown[];supportMessages:{id:string;role:'assistant'|'customer';text:string}[]};
export type Doc={revision:number;state:SharedState;error?:string};
export type Command={action:'accept'|'schedule'|'decline'|'reply';id?:string;detail?:string};
export type LinkStatus='idle'|'connecting'|'connected'|'offline'|'error';
const INVALID='That code is not valid. Check the 32-character code from the customer app and try again.';
const EXPIRED='This session has expired. Ask the customer for a fresh connection code.';
export function useServiceSync(){
 const [session,setSession]=useState(''),[status,setStatus]=useState<LinkStatus>('idle'),[statusText,setStatusText]=useState('Not connected'),[doc,setDoc]=useState<Doc|null>(null);
 const busy=useRef(false),latest=useRef<Doc|null>(null);
 useEffect(()=>{latest.current=doc},[doc]);
 useEffect(()=>{let active=true;AsyncStorage.getItem('sw-partner-room').then(saved=>{const param=typeof window!=='undefined'?new URLSearchParams(window.location.search).get('session'):null;const code=param||saved||'';if(active&&/^[a-f0-9]{32}$/.test(code)){setStatus('connecting');setStatusText('Connecting…');setSession(code);AsyncStorage.setItem('sw-partner-room',code).catch(()=>undefined)}});return()=>{active=false}},[]);
 useEffect(()=>{
  if(!session)return;let active=true;
  const tick=async()=>{
   if(busy.current||!active)return;busy.current=true;
   try{
    const r=await fetch(API,{headers:{Authorization:'Bearer '+session}});
    if(r.status===401){if(active){setStatus('error');setStatusText(INVALID)}return}
    if(r.status===410){if(active){setStatus('error');setStatusText(EXPIRED)}return}
    const d=await r.json() as Doc;if(!r.ok)throw Error(d.error||'Unable to reach the shared session.');
    if(active){setDoc(d);setStatus('connected');setStatusText('Connected · live view of the customer record')}
   }catch(e){if(active){setStatus('offline');setStatusText(e instanceof Error?e.message:'Waiting to reconnect. Nothing was changed.')}}finally{busy.current=false}
  };void tick();const timer=setInterval(tick,5000);return()=>{active=false;clearInterval(timer)};
 },[session]);
 const connect=useCallback(async(value:string)=>{const code=value.trim().toLowerCase().match(/[a-f0-9]{32}/)?.[0];if(!code)return false;await AsyncStorage.setItem('sw-partner-room',code).catch(()=>undefined);setDoc(null);setStatus('connecting');setStatusText('Connecting…');setSession(code);return true},[]);
 const disconnect=useCallback(async()=>{await AsyncStorage.removeItem('sw-partner-room').catch(()=>undefined);setSession('');setDoc(null);setStatus('idle');setStatusText('Not connected')},[]);
 const sendCommand=useCallback(async(command:Command):Promise<{ok:boolean;message:string}>=>{
  const current=latest.current;if(!session||!current)return{ok:false,message:'Connect to a live session first.'};
  try{
   const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session},body:JSON.stringify({revision:current.revision,eventId:'P-'+Date.now()+'-'+Math.random().toString(36).slice(2),command})});
   const d=await r.json() as Doc;
   if(r.status===409){setDoc(d);return{ok:false,message:'A newer update arrived from the customer. Review the latest record and try again.'}}
   if(r.status===410){setStatus('error');setStatusText(EXPIRED);return{ok:false,message:EXPIRED}}
   if(r.status===401){setStatus('error');setStatusText(INVALID);return{ok:false,message:INVALID}}
   if(!r.ok)return{ok:false,message:d.error||'The update was not applied. Refresh and try again.'};
   setDoc(d);return{ok:true,message:'Sent. The customer app reflects this immediately.'}
  }catch{return{ok:false,message:'Network issue sending the update. Nothing was changed.'}}
 },[session]);
 return{session,status,statusText,doc,connect,disconnect,sendCommand};
}
