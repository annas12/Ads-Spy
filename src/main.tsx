import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Search, Flame, ExternalLink, Bookmark, SlidersHorizontal} from 'lucide-react';
import './styles.css';

type Ad = {
  id:string; pageName:string; pageId:string; body:string; startDate:string; endDate?:string|null;
  platforms:string[]; mediaType:string; status:string; snapshotUrl?:string; country?:string;
};

const demo:Ad[] = [
  {id:'demo-1',pageName:'Herbal Wanita Demo',pageId:'10001',body:'Contoh creative herbal wanita untuk preview MVP.',startDate:'2026-05-12',platforms:['Facebook','Instagram'],mediaType:'VIDEO',status:'ACTIVE',country:'ID'},
  {id:'demo-2',pageName:'Healthy Living Demo',pageId:'10002',body:'Contoh iklan kedua. Hubungkan Worker dan token Meta untuk hasil API.',startDate:'2026-09-02',platforms:['Facebook'],mediaType:'IMAGE',status:'ACTIVE',country:'ID'}
];

function ageDays(start:string){return Math.max(0,Math.floor((Date.now()-new Date(start+'T00:00:00').getTime())/86400000))}
function score(ad:Ad){const age=ageDays(ad.startDate);return Math.min(100,Math.round((Math.min(age,120)/120)*75 + (ad.platforms.length>1?10:0) + (ad.status==='ACTIVE'?15:0)))}

function App(){
 const [q,setQ]=useState(''); const [page,setPage]=useState(''); const [country,setCountry]=useState('ID');
 const [status,setStatus]=useState('ACTIVE'); const [media,setMedia]=useState('ALL'); const [platform,setPlatform]=useState('ALL');
 const [minAge,setMinAge]=useState(0); const [from,setFrom]=useState(''); const [to,setTo]=useState('');
 const [ads,setAds]=useState<Ad[]>(demo); const [loading,setLoading]=useState(false); const [error,setError]=useState('');

 async function search(){
  setLoading(true); setError('');
  const p=new URLSearchParams({q,page,country,status,media,platform,minAge:String(minAge)}); if(from)p.set('from',from); if(to)p.set('to',to);
  try{const r=await fetch(`/api/search?${p}`); if(!r.ok)throw new Error(await r.text()); const j=await r.json(); setAds(j.data||[])}
  catch(e:any){setError('Backend belum terhubung. Menampilkan data demo.'); setAds(demo)} finally{setLoading(false)}
 }

 const filtered=useMemo(()=>ads.filter(a=>ageDays(a.startDate)>=minAge).sort((a,b)=>score(b)-score(a)),[ads,minAge]);
 return <div className="app">
  <header><div><div className="brand">ADS<span>SPY</span></div><p>Meta ads research dashboard</p></div><div className="badge">MVP</div></header>
  <section className="hero"><h1>Temukan iklan yang masih hidup.<br/><span>Bedah sebelum ikut scale.</span></h1><p>Filter creative, halaman, umur iklan, platform, dan tanggal tayang dalam satu dashboard.</p></section>
  <section className="panel">
   <div className="panelTitle"><SlidersHorizontal size={18}/> Search filters</div>
   <div className="grid">
    <label>Keyword<input value={q} onChange={e=>setQ(e.target.value)} placeholder="herbal wanita, ebook, maag..."/></label>
    <label>Page / Page ID<input value={page} onChange={e=>setPage(e.target.value)} placeholder="Nama halaman atau ID"/></label>
    <label>Country<select value={country} onChange={e=>setCountry(e.target.value)}><option value="ID">Indonesia</option><option value="US">United States</option><option value="GB">United Kingdom</option><option value="ALL">All</option></select></label>
    <label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option>ACTIVE</option><option>INACTIVE</option><option>ALL</option></select></label>
    <label>Media<select value={media} onChange={e=>setMedia(e.target.value)}><option>ALL</option><option>VIDEO</option><option>IMAGE</option><option>MEME</option><option>NONE</option></select></label>
    <label>Platform<select value={platform} onChange={e=>setPlatform(e.target.value)}><option>ALL</option><option>FACEBOOK</option><option>INSTAGRAM</option><option>MESSENGER</option><option>THREADS</option></select></label>
    <label>Published from<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
    <label>Published to<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
    <label>Minimum ad age<select value={minAge} onChange={e=>setMinAge(Number(e.target.value))}><option value="0">Any age</option><option value="7">7+ days</option><option value="30">30+ days</option><option value="90">90+ days</option></select></label>
   </div>
   <button className="searchBtn" onClick={search} disabled={loading}><Search size={18}/>{loading?'Searching...':'Search Ads'}</button>
   {error&&<div className="notice">{error}</div>}
  </section>

  <div className="resultsHead"><div><strong>{filtered.length}</strong> ads found</div><div>Sorted by Winner Score</div></div>
  <section className="cards">{filtered.map(ad=><article className="card" key={ad.id}>
   <div className="preview"><div className="mediaPill">{ad.mediaType}</div><div className="previewText">CREATIVE PREVIEW</div></div>
   <div className="content"><div className="row"><div><h3>{ad.pageName}</h3><small>Page ID {ad.pageId}</small></div><div className="score"><Flame size={15}/>{score(ad)}</div></div>
   <p className="copy">{ad.body||'No primary text available.'}</p>
   <div className="meta"><span>Started {ad.startDate}</span><span className="hot">{ageDays(ad.startDate)} days running</span><span>{ad.platforms.join(' · ')}</span></div>
   <div className="actions"><button><Bookmark size={16}/>Save</button>{ad.snapshotUrl&&<a href={ad.snapshotUrl} target="_blank"><ExternalLink size={16}/>View ad</a>}</div>
   </div></article>)}</section>
 </div>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
