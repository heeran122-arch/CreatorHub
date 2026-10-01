"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock3, FileVideo, MoreHorizontal, Play, Trash2 } from "lucide-react";

type Draft={title:string;updated:string;progress:number};
const seed:Draft[]=[{title:"Seattle Night Drive",updated:"2 hours ago",progress:72},{title:"LifeSim Launch Trailer",updated:"Yesterday",progress:48},{title:"New creator project",updated:"Just now",progress:18}];

export default function DraftsPage(){
 const [items,setItems]=useState< Draft[]>(seed);
 useEffect(()=>{try{const saved=localStorage.getItem("creatorhub-drafts");if(saved)setItems(JSON.parse(saved))}catch{}},[]);
 function remove(i:number){const next=items.filter((_,n)=>n!==i);setItems(next);localStorage.setItem("creatorhub-drafts",JSON.stringify(next))}
 return <main className="pageShell"><header className="pageTop"><Link href="/" className="back"><ArrowLeft size={17}/> Dashboard</Link><div className="pageTitle"><Clock3 size={18}/><b>Drafts</b></div><Link href="/editor" className="primary"><FileVideo size={16}/> Open editor</Link></header>
 <section className="pageContent"><div className="pageIntro"><div><span className="eyebrow">WORKSPACE</span><h1>Saved drafts</h1><p>Pick up unfinished edits whenever you are ready.</p></div></div>
 <div className="draftList">{items.map((d,i)=><article className="draftRow" key={d.title+i}><div className="draftIcon"><FileVideo size={20}/></div><div className="draftMain"><h3>{d.title}</h3><p>Last edited {d.updated}</p><div className="draftProgress"><span style={{width:d.progress+"%"}}/></div></div><b className="draftPercent">{d.progress}%</b><Link href="/editor" className="draftOpen"><Play size={15}/> Continue</Link><button className="iconDelete" onClick={()=>remove(i)} title="Delete draft"><Trash2 size={16}/></button></article>)}</div></section></main>
}