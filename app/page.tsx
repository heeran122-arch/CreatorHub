"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3, Bell, ChevronDown, Clapperboard, FileVideo, FolderOpen,
  Home, Library, Play, Plus, Settings, Sparkles, Upload, WandSparkles,
  Youtube, Clock3, MoreHorizontal
} from "lucide-react";

const projects = [
  { title: "Seattle Night Drive", type: "Short video", time: "2 hours ago", progress: 72 },
  { title: "LifeSim Launch Trailer", type: "Project", time: "Yesterday", progress: 48 },
  { title: "Creator Tips #04", type: "Short video", time: "3 days ago", progress: 100 },
];

export default function HomePage() {
  const [active, setActive] = useState("Dashboard");

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brandMark"><Sparkles size={18}/></div><span>CreatorHub</span></div>
        <div className="workspace"><div className="avatar">H</div><div><b>Heeran</b><small>Personal workspace</small></div><ChevronDown size={15}/></div>
        <nav>
          <Link href="/" className={active === "Dashboard" ? "nav active" : "nav"}><Home size={18}/><span>Dashboard</span></Link>
          <Link href="/editor" className="nav"><Clapperboard size={18}/><span>Editor</span></Link>
          <Link href="/projects" className="nav"><Library size={18}/><span>Projects</span></Link>
          <button className="nav" onClick={() => setActive("Analytics")}><BarChart3 size={18}/><span>Analytics</span></button>
        </nav>
        <div className="navLabel">WORKSPACE</div>
        <nav>
          <Link href="/drafts" className="nav"><FileVideo size={18}/><span>Drafts</span><em>3</em></Link>
          <button className="nav"><Youtube size={18}/><span>Channels</span></button>
        </nav>
        <div className="sideBottom">
          <button className="nav"><Settings size={18}/><span>Settings</span></button>
          <div className="upgrade"><Sparkles size={17}/><div><b>Creator Pro</b><small>More tools are coming</small></div></div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><span className="eyebrow">CREATOR STUDIO</span><h1>{active}</h1></div>
          <div className="topActions"><button className="iconBtn"><Bell size={18}/></button><button className="profile">H</button></div>
        </header>

        {active === "Dashboard" ? <Dashboard /> : <Placeholder title={active} />}
      </section>
    </main>
  );
}

function Dashboard() {
  return <div className="dashboard">
    <section className="hero">
      <div><span className="pill"><Sparkles size={13}/> AI creator workspace</span><h2>Make more.<br/><span>Post faster.</span></h2><p>Turn raw footage into ready-to-post content with CreatorHub.</p>
      <div className="heroButtons"><Link href="/editor" className="primary"><Upload size={17}/> Upload video</Link><Link href="/ai" className="secondary"><WandSparkles size={17}/> Try AI Edit</Link></div></div>
      <div className="heroGraphic"><div className="glow"></div><div className="preview"><div className="previewTop"><span>PREVIEW</span><span>00:24</span></div><div className="play"><Play size={22} fill="currentColor"/></div><div className="timeline"><i></i><i></i><i></i><i></i><i></i></div></div></div>
    </section>

    <div className="sectionHead"><div><h3>Quick actions</h3><p>Start with a tool and keep creating.</p></div></div>
    <section className="quick">
      <Link href="/editor" className="actionLink"><Action icon={<Upload/>} title="Upload video" text="Bring in raw footage" /></Link>
      <Link href="/editor" className="actionLink"><Action icon={<WandSparkles/>} title="Auto Cut" text="Find the best moments" /></Link>
      <Link href="/ai" className="actionLink"><Action icon={<Sparkles/>} title="Simple AI Edit" text="Captions, cuts & zooms" /></Link>
      <Action icon={<Plus/>} title="New project" text="Start from scratch" dashed />
    </section>

    <div className="sectionHead projectsHead"><div><h3>Recent projects</h3><p>Your latest edits and drafts.</p></div><Link href="/projects" className="view">View all <ChevronDown size={15}/></Link></div>
    <section className="projects">
      {projects.map((p) => <article className="project" key={p.title}><div className="thumb"><div className="thumbPlay"><Play size={15} fill="currentColor"/></div><span>{p.progress === 100 ? "READY" : "DRAFT"}</span></div><div className="projectInfo"><div><h4>{p.title}</h4><small>{p.type} · {p.time}</small></div><MoreHorizontal size={18}/><div className="progress"><span style={{width:p.progress+"%"}}></span></div></div></article>)}
    </section>

    <section className="connect"><div className="connectIcon"><Youtube size={22}/></div><div><h3>Connect your channels</h3><p>Keep your YouTube and other platforms ready for publishing.</p></div><button className="secondary">Connect</button></section>
  </div>
}

function Action({icon,title,text,dashed=false}:{icon:React.ReactNode,title:string,text:string,dashed?:boolean}) {
  return <button className={"action "+(dashed ? "dashed" : "")}><div className="actionIcon">{icon}</div><div><b>{title}</b><span>{text}</span></div><span className="arrow">→</span></button>
}

function Placeholder({title}:{title:string}) {
  return <div className="placeholder"><div className="placeholderIcon"><Clapperboard size={28}/></div><h2>{title}</h2><p>This part of CreatorHub is ready for the next build.</p><button className="primary"><Plus size={17}/> Create something</button></div>
}