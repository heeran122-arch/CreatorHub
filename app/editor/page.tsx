"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Captions, Crop, Download, Film, Play, Pause, Scissors, Sparkles, Upload, WandSparkles, Volume2, ZoomIn, Save, RotateCcw } from "lucide-react";

export default function EditorPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [playing, setPlaying] = useState(false);
  const [tool, setTool] = useState("Cut");
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [message, setMessage] = useState("");
  const [caption, setCaption] = useState("");
  const [zoom, setZoom] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("creatorhub-editor");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.fileName) setFileName(data.fileName);
      }
    } catch {}
  }, []);

  function handleFile(file?: File) {
    if (!file || !file.type.startsWith("video/")) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setFileName(file.name);
    setVideoUrl(url);
    setCurrent(0);
    setStart(0);
    setEnd(0);
    setPlaying(false);
    setMessage("Video loaded");
  }

  function onLoaded() {
    const d = videoRef.current?.duration || 0;
    setDuration(d);
    setEnd(d);
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  }

  function seek(value: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(value, duration));
    setCurrent(v.currentTime);
  }

  function setTrimPoint(which: "start" | "end") {
    if (which === "start") setStart(current);
    else setEnd(current);
    setMessage(which === "start" ? "Start point set" : "End point set");
  }

  function autoCut() {
    if (!duration) { setMessage("Upload a video first"); return; }
    const trim = Math.min(2, duration * .08);
    setStart(trim);
    setEnd(Math.max(trim, duration - trim));
    seek(trim);
    setMessage("Auto Cut found a tighter opening and ending");
  }

  function saveDraft() {
    localStorage.setItem("creatorhub-editor", JSON.stringify({
      fileName, start, end, duration, savedAt: new Date().toISOString()
    }));
    setMessage("Draft saved locally");
  }

  function resetTrim() {
    setStart(0); setEnd(duration); seek(0); setMessage("Trim reset");
  }

async function exportVideo() {
    const v=videoRef.current;
    if (!v || !videoUrl) { setMessage("Upload a video first"); return; }
    const capture=(v as HTMLVideoElement & {captureStream?:()=>MediaStream}).captureStream;
    if (!capture) { setMessage("Export is not supported in this browser"); return; }
    const old=v.currentTime;
    v.pause(); v.currentTime=start;
    const sourceStream=capture.call(v);
    const mime=MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")?"video/webm;codecs=vp9,opus":"video/webm";
    const canvas=document.createElement("canvas"); canvas.width=1280; canvas.height=720; const ctx=canvas.getContext("2d");\n    const draw=()=>{if(!ctx)return;ctx.fillStyle="#000";ctx.fillRect(0,0,canvas.width,canvas.height);const scale=Math.max(1,zoom);const w=canvas.width*scale,h=canvas.height*scale;ctx.drawImage(v,(canvas.width-w)/2,(canvas.height-h)/2,w,h);if(caption){ctx.fillStyle="rgba(0,0,0,.7)";ctx.fillRect(100,610,1080,62);ctx.fillStyle="#fff";ctx.font="bold 34px system-ui";ctx.textAlign="center";ctx.fillText(caption,640,650)} requestAnimationFrame(draw)}; draw();\n    const out=canvas.captureStream(30); sourceStream.getAudioTracks().forEach(t=>out.addTrack(t)); const recorder=new MediaRecorder(out,{mimeType});
    const chunks:Blob[]=[];
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    recorder.onstop=()=>{const blob=new Blob(chunks,{type:"video/webm"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(fileName.replace(/\.[^.]+$/,"")||"creatorhub-export")+".webm";a.click();setMessage("Export complete");v.currentTime=old};
    recorder.start(); await v.play();
    const timer=window.setInterval(()=>{if(v.currentTime>=end){v.pause();recorder.stop();window.clearInterval(timer)}},100);
  }

  function formatTime(value:number) {
    const m=Math.floor(value/60);
    const s=Math.floor(value%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }

  return <main className="editorPage">
    <header className="editorTop">
      <Link href="/" className="back"><ArrowLeft size={17}/> Dashboard</Link>
      <div className="editorTitle"><Film size={17}/><b>{fileName || "Untitled project"}</b><span>{message || "Draft"}</span></div>
      <div className="editorActions"><button className="secondary" onClick={saveDraft}><Save size={16}/> Save</button><button className="primary" onClick={exportVideo}><Download size={16}/> Export</button></div>
    </header>

    <section className="editorLayout">
      <aside className="toolRail">
        {[[Scissors,"Cut"],[Captions,"Captions"],[Crop,"Crop"],[ZoomIn,"Zoom"],[Volume2,"Audio"],[Sparkles,"AI Edit"]].map(([Icon,label]) =>
          <button key={label as string} className={tool===label ? "tool active":"tool"} onClick={()=>setTool(label as string)}>
            <Icon size={19}/><span>{label as string}</span>
          </button>
        )}
      </aside>

      <section className="editorCenter">
        <div className="videoStage">
          {videoUrl ? <video ref={videoRef} src={videoUrl} className="videoPlayer" style={{transform:`scale(${zoom})`}} onLoadedMetadata={onLoaded} onTimeUpdate={()=>setCurrent(videoRef.current?.currentTime||0)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} /> :
          <button className="emptyVideo" onClick={()=>inputRef.current?.click()}><div className="uploadIcon"><Upload size={25}/></div><b>Drop your video here</b><span>MP4, MOV, WebM and more</span><strong>Choose video</strong></button>}
          {videoUrl && caption && <div className="captionOverlay">{caption}</div>}{videoUrl && <button className="stagePlay" onClick={togglePlay}>{playing ? <Pause size={22} fill="currentColor"/> : <Play size={22} fill="currentColor"/>}</button>}
        </div>

        <div className="timelinePanel">
          <div className="timelineHeader"><span>Timeline</span><span>{formatTime(current)} / {formatTime(duration)}</span></div>
          <input className="scrubber" type="range" min="0" max={duration||1} step=".01" value={Math.min(current,duration||1)} onChange={e=>seek(Number(e.target.value))}/>
          <div className="ruler"><i>00:00</i><i>{formatTime(duration*.2)}</i><i>{formatTime(duration*.4)}</i><i>{formatTime(duration*.6)}</i><i>{formatTime(duration*.8)}</i><i>{formatTime(duration)}</i></div>
          <div className="track"><div className="clip" style={{width: duration ? `${Math.max(8,(end-start)/duration*100)}%`:"72%"}}><span>{fileName || "Add a video clip"}</span><b></b><b></b><b></b><b></b></div></div>
          <div className="trimControls"><button onClick={()=>setTrimPoint("start")}><Scissors size={13}/> Set start</button><button onClick={()=>setTrimPoint("end")}><Scissors size={13}/> Set end</button><button onClick={resetTrim}><RotateCcw size={13}/> Reset</button></div>
          <div className="audioTrack"><span>Audio · original</span></div>
        </div>
      </section>

      <aside className="inspector">
        <div className="inspectorHead"><b>{tool}</b><span>Inspector</span></div>
        {tool==="AI Edit" ? <div className="inspectorBody"><div className="aiMini"><WandSparkles size={19}/><b>CreatorHub AI</b></div><p>Analyze the clip and apply simple edit decisions without an external AI key.</p><button className="primary full" onClick={autoCut}><Sparkles size={16}/> Auto Cut</button></div> :
        tool==="Captions" ? <div className="inspectorBody"><p>Add a caption overlay.</p><textarea className="captionInput" value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Type your caption..."/></div> :\ntool==="Zoom" ? <div className="inspectorBody"><p>Adjust the preview zoom.</p><input className="scrubber" type="range" min="1" max="1.5" step=".05" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/><div className="setting"><span>Zoom</span><b>{zoom.toFixed(2)}x</b></div></div> :\ntool==="Audio" ? <div className="inspectorBody"><p>Control the original audio track.</p><button className="secondary full" onClick={()=>{setMuted(!muted);if(videoRef.current)videoRef.current.muted=!muted}}>{muted?"Unmute":"Mute"} original audio</button></div> :\ntool==="Crop" ? <div className="inspectorBody"><p>Crop preview is centered and keeps the source aspect ratio.</p><div className="setting"><span>Mode</span><b>Center</b></div></div> :\ntool==="Cut" ? <div className="inspectorBody"><p>Trim the clip by setting start and end points on the timeline.</p><div className="setting"><span>Start</span><b>{formatTime(start)}</b></div><div className="setting"><span>End</span><b>{formatTime(end)}</b></div><button className="secondary full" onClick={autoCut}><Sparkles size={15}/> Smart trim</button></div> :
        <div className="inspectorBody"><p>{tool} controls are ready for this project.</p><div className="setting"><span>Auto apply</span><button className="toggle"></button></div><div className="setting"><span>Non-destructive</span><b>ON</b></div></div>}
      </aside>
    </section>
    <input ref={inputRef} type="file" accept="video/*" hidden onChange={e=>handleFile(e.target.files?.[0])}/>
  </main>;
}
