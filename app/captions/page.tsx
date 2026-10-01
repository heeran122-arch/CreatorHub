"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Captions, Plus, Trash2 } from "lucide-react";

type Caption={id:number,start:number,end:number,text:string};
const fmt=(n:number)=>{const m=Math.floor(n/60);const s=Math.floor(n%60).toString().padStart(2,"0");return `${m}:${s}`};

export default function CaptionsPage(){
 const [items,setItems]=useState<Caption[]>([{id:1,start:0,end:3,text:"Welcome to CreatorHub"}]);
 const [text,setText]=useState("");
 function add(){if(!text.trim())return;setItems(x=>[...x,{id:Date.now(),start:x.length*3,end:x.length*3+3,text:text.trim()}]);setText("")}
 function remove(id:number){setItems(x=>x.filter(c=>c.id!==id))}
 return <main className="pageShell"><header className="pageTop"><Link href="/editor" className="back"><ArrowLeft size={17}/> Editor</Link><div className="pageTitle"><Captions size={17}/> Caption Studio</div><span/></header><section className="pageContent"><div className="pageIntro"><div><span className="eyebrow">CREATORHUB TOOL</span><h1>Captions</h1><p>Create and organize caption blocks for your video.</p></div></div><div className="captionComposer"><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Type a caption..."/><button className="primary" onClick={add}><Plus size={16}/> Add caption</button></div><div className="captionList">{items.map(c=><article className="captionRow" key={c.id}><div className="captionTime">{fmt(c.start)} → {fmt(c.end)}</div><div><b>{c.text}</b><small>Caption block</small></div><button className="iconDelete" onClick={()=>remove(c.id)}><Trash2 size={16}/></button></article>)}</div></section></main>
}