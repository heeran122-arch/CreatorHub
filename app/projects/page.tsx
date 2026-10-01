"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clapperboard, FileVideo, MoreHorizontal, Plus, Search, Upload } from "lucide-react";

type Project = { title:string; type:string; status:string; updated:string };

const seed: Project[] = [
  {title:"Seattle Night Drive",type:"Short video",status:"Draft",updated:"2 hours ago"},
  {title:"LifeSim Launch Trailer",type:"Project",status:"Draft",updated:"Yesterday"},
  {title:"Creator Tips #04",type:"Short video",status:"Ready",updated:"3 days ago"},
];

export default function ProjectsPage(){
  const [items,setItems]=useState<Project[]>(seed);
  const [query,setQuery]=useState("");
  useEffect(()=>{try{const saved=localStorage.getItem("creatorhub-projects");if(saved)setItems(JSON.parse(saved))}catch{}},[]);
  const filtered=items.filter(x=>(x.title+" "+x.type+" "+x.status).toLowerCase().includes(query.toLowerCase()));
  function newProject(){
    const item={title:"Untitled project",type:"Video project",status:"Draft",updated:"Just now"};
    const next=[item,...items]; setItems(next); localStorage.setItem("creatorhub-projects",JSON.stringify(next));
  }
  return <main className="pageShell">
    <header className="pageTop"><Link href="/" className="back"><ArrowLeft size={17}/> Dashboard</Link><div className="pageTitle"><Clapperboard size={18}/><b>Projects</b></div><button className="primary" onClick={newProject}><Plus size={16}/> New project</button></header>
    <section className="pageContent">
      <div className="pageIntro"><div><span className="eyebrow">WORKSPACE</span><h1>Your projects</h1><p>Keep edits, drafts, and finished videos in one place.</p></div><Link href="/editor" className="secondary"><Upload size={16}/> Upload video</Link></div>
      <div className="searchBox"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search projects..." /></div>
      <div className="projectGrid">{filtered.map((p,i)=><article className="projectCard" key={p.title+i}><div className="projectThumb"><FileVideo size={25}/><span>{p.status}</span><button><MoreHorizontal size={17}/></button></div><div className="projectCardInfo"><h3>{p.title}</h3><p>{p.type} · {p.updated}</p></div></article>)}</div>
      {!filtered.length&&<div className="emptyState"><Clapperboard size={25}/><h3>No projects found</h3><p>Try another search or create a new project.</p></div>}
    </section>
  </main>
}