"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Captions, Crop, Download, Film, Play, Scissors, Sparkles, Upload, WandSparkles, Volume2, ZoomIn } from "lucide-react";

export default function EditorPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [playing, setPlaying] = useState(false);
  const [tool, setTool] = useState("Select");

  function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("video/")) return;
    setFileName(file.name);
    setVideoUrl(URL.createObjectURL(file));
    setPlaying(false);
  }

  return (
    <main className="editorPage">
      <header className="editorTop">
        <Link href="/" className="back"><ArrowLeft size={17}/> Dashboard</Link>
        <div className="editorTitle"><Film size={17}/><b>{fileName || "Untitled project"}</b><span>Draft</span></div>
        <div className="editorActions"><button className="secondary"><Download size={16}/> Export</button></div>
      </header>

      <section className="editorLayout">
        <aside className="toolRail">
          {[
            [Scissors, "Cut"], [Captions, "Captions"], [Crop, "Crop"], [ZoomIn, "Zoom"], [Volume2, "Audio"], [Sparkles, "AI Edit"]
          ].map(([Icon, label]) => (
            <button key={label as string} className={tool === label ? "tool active" : "tool"} onClick={() => setTool(label as string)}>
              <Icon size={19}/><span>{label as string}</span>
            </button>
          ))}
        </aside>

        <section className="editorCenter">
          <div className="videoStage">
            {videoUrl ? (
              <video src={videoUrl} controls={false} className="videoPlayer" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
            ) : (
              <button className="emptyVideo" onClick={() => inputRef.current?.click()}>
                <div className="uploadIcon"><Upload size={25}/></div>
                <b>Drop your video here</b>
                <span>MP4, MOV, WebM and more</span>
                <strong>Choose video</strong>
              </button>
            )}
            {videoUrl && !playing && <button className="stagePlay" onClick={(e) => { const video = e.currentTarget.previousElementSibling as HTMLVideoElement | null; video?.play(); }}><Play size={22} fill="currentColor"/></button>}
          </div>

          <div className="timelinePanel">
            <div className="timelineHeader"><span>Timeline</span><span>{tool} tool</span></div>
            <div className="ruler"><i>00:00</i><i>00:05</i><i>00:10</i><i>00:15</i><i>00:20</i><i>00:25</i></div>
            <div className="track"><div className="clip"><span>{fileName || "Add a video clip"}</span><b></b><b></b><b></b><b></b></div></div>
            <div className="audioTrack"><span>Audio</span></div>
          </div>
        </section>

        <aside className="inspector">
          <div className="inspectorHead"><b>{tool}</b><span>Inspector</span></div>
          {tool === "AI Edit" ? (
            <div className="inspectorBody">
              <div className="aiMini"><WandSparkles size={19}/><b>CreatorHub AI</b></div>
              <p>Let CreatorHub suggest cuts, captions, zooms, and a stronger opening.</p>
              <button className="primary" onClick={() => setTool("Cut")}><Sparkles size={16}/> Analyze video</button>
            </div>
          ) : (
            <div className="inspectorBody">
              <p>Select a clip on the timeline to edit it with the {tool.toLowerCase()} tool.</p>
              <div className="setting"><span>Auto apply</span><button className="toggle"></button></div>
              <div className="setting"><span>Non-destructive</span><b>ON</b></div>
            </div>
          )}
        </aside>
      </section>

      <input ref={inputRef} type="file" accept="video/*" hidden onChange={(e) => handleFile(e.target.files?.[0])}/>
    </main>
  );
}
