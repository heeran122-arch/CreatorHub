"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Captions,
  Crop,
  Download,
  Film,
  Play,
  Pause,
  Scissors,
  Sparkles,
  Upload,
  WandSparkles,
  Volume2,
  ZoomIn,
  Save,
  RotateCcw,
} from "lucide-react";

type Tool = "Cut" | "Captions" | "Crop" | "Zoom" | "Audio" | "AI Edit";

const tools: { label: Tool; icon: typeof Scissors }[] = [
  { label: "Cut", icon: Scissors },
  { label: "Captions", icon: Captions },
  { label: "Crop", icon: Crop },
  { label: "Zoom", icon: ZoomIn },
  { label: "Audio", icon: Volume2 },
  { label: "AI Edit", icon: Sparkles },
];

export default function EditorPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [playing, setPlaying] = useState(false);
  const [tool, setTool] = useState<Tool>("Cut");
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

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  function handleFile(file?: File) {
    if (!file || !file.type.startsWith("video/")) {
      setMessage("Choose a video file");
      return;
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setFileName(file.name);
    setVideoUrl(url);
    setCurrent(0);
    setStart(0);
    setEnd(0);
    setDuration(0);
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
    if (v.paused) {
      void v.play();
    } else {
      v.pause();
    }
  }

  function seek(value: number) {
    const v = videoRef.current;
    if (!v) return;
    const next = Math.max(0, Math.min(value, duration));
    v.currentTime = next;
    setCurrent(next);
  }

  function setTrimPoint(which: "start" | "end") {
    if (which === "start") {
      setStart(Math.min(current, end || current));
    } else {
      setEnd(Math.max(current, start));
    }
    setMessage(which === "start" ? "Start point set" : "End point set");
  }

  function autoCut() {
    if (!duration) {
      setMessage("Upload a video first");
      return;
    }
    const trim = Math.min(2, duration * 0.08);
    setStart(trim);
    setEnd(Math.max(trim, duration - trim));
    seek(trim);
    setMessage("Auto Cut found a tighter opening and ending");
  }

  function saveDraft() {
    localStorage.setItem(
      "creatorhub-editor",
      JSON.stringify({
        fileName,
        start,
        end,
        duration,
        caption,
        zoom,
        muted,
        savedAt: new Date().toISOString(),
      }),
    );
    setMessage("Draft saved locally");
  }

  function resetTrim() {
    setStart(0);
    setEnd(duration);
    seek(0);
    setMessage("Trim reset");
  }

  async function exportVideo() {
    const v = videoRef.current;
    if (!v || !videoUrl) {
      setMessage("Upload a video first");
      return;
    }

    const capture = (v as HTMLVideoElement & {
      captureStream?: () => MediaStream;
    }).captureStream;

    if (!capture || typeof MediaRecorder === "undefined") {
      setMessage("Export is not supported in this browser");
      return;
    }

    if (end <= start) {
      setMessage("Set an end point after the start point");
      return;
    }

    const oldTime = v.currentTime;
    v.pause();
    v.currentTime = start;

    const sourceStream = capture.call(v);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm";

    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");

    if (!ctx || typeof canvas.captureStream !== "function") {
      setMessage("Export is not supported in this browser");
      return;
    }

    let animationId = 0;
    const draw = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scale = Math.max(1, zoom);
      const w = canvas.width * scale;
      const h = canvas.height * scale;
      ctx.drawImage(v, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);

      if (caption.trim()) {
        ctx.fillStyle = "rgba(0,0,0,.7)";
        ctx.fillRect(100, 610, 1080, 62);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 34px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(caption, 640, 650);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const outputStream = canvas.captureStream(30);
    sourceStream.getAudioTracks().forEach((track) => outputStream.addTrack(track));

    const recorder = new MediaRecorder(outputStream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };

    recorder.onstop = () => {
      cancelAnimationFrame(animationId);
      outputStream.getTracks().forEach((track) => track.stop());
      sourceStream.getTracks().forEach((track) => track.stop());

      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        (fileName.replace(/\.[^.]+$/, "") || "creatorhub-export") + ".webm";
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Export complete");
      v.currentTime = oldTime;
    };

    recorder.start();
    try {
      await v.play();
    } catch {
      recorder.stop();
      setMessage("Playback could not start");
      return;
    }

    const timer = window.setInterval(() => {
      if (v.currentTime >= end || v.ended) {
        window.clearInterval(timer);
        v.pause();
        recorder.stop();
      }
    }, 100);
  }

  function formatTime(value: number) {
    const m = Math.floor(value / 60);
    const s = Math.floor(value % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <main className="editorPage">
      <header className="editorTop">
        <Link href="/" className="back">
          <ArrowLeft size={17} /> Dashboard
        </Link>
        <div className="editorTitle">
          <Film size={17} />
          <b>{fileName || "Untitled project"}</b>
          <span>{message || "Draft"}</span>
        </div>
        <div className="editorActions">
          <button className="secondary" onClick={saveDraft}>
            <Save size={16} /> Save
          </button>
          <button className="primary" onClick={exportVideo}>
            <Download size={16} /> Export
          </button>
        </div>
      </header>

      <section className="editorLayout">
        <aside className="toolRail">
          {tools.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className={tool === label ? "tool active" : "tool"}
              onClick={() => setTool(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </aside>

        <section className="editorCenter">
          <div className="videoStage">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="videoPlayer"
                style={{ transform: `scale(${zoom})` }}
                onLoadedMetadata={onLoaded}
                onTimeUpdate={() =>
                  setCurrent(videoRef.current?.currentTime || 0)
                }
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
            ) : (
              <button
                className="emptyVideo"
                onClick={() => inputRef.current?.click()}
              >
                <div className="uploadIcon">
                  <Upload size={25} />
                </div>
                <b>Drop your video here</b>
                <span>MP4, MOV, WebM and more</span>
                <strong>Choose video</strong>
              </button>
            )}
            {videoUrl && caption && (
              <div className="captionOverlay">{caption}</div>
            )}
            {videoUrl && (
              <button className="stagePlay" onClick={togglePlay}>
                {playing ? (
                  <Pause size={22} fill="currentColor" />
                ) : (
                  <Play size={22} fill="currentColor" />
                )}
              </button>
            )}
          </div>

          <div className="timelinePanel">
            <div className="timelineHeader">
              <span>Timeline</span>
              <span>
                {formatTime(current)} / {formatTime(duration)}
              </span>
            </div>
            <input
              className="scrubber"
              type="range"
              min="0"
              max={duration || 1}
              step="0.01"
              value={Math.min(current, duration || 1)}
              onChange={(e) => seek(Number(e.target.value))}
            />
            <div className="ruler">
              <i>00:00</i>
              <i>{formatTime(duration * 0.2)}</i>
              <i>{formatTime(duration * 0.4)}</i>
              <i>{formatTime(duration * 0.6)}</i>
              <i>{formatTime(duration * 0.8)}</i>
              <i>{formatTime(duration)}</i>
            </div>
            <div className="track">
              <div
                className="clip"
                style={{
                  width: duration
                    ? `${Math.max(8, ((end - start) / duration) * 100)}%`
                    : "72%",
                }}
              >
                <span>{fileName || "Add a video clip"}</span>
                <b></b><b></b><b></b><b></b>
              </div>
            </div>
            <div className="trimControls">
              <button onClick={() => setTrimPoint("start")}>
                <Scissors size={13} /> Set start
              </button>
              <button onClick={() => setTrimPoint("end")}>
                <Scissors size={13} /> Set end
              </button>
              <button onClick={resetTrim}>
                <RotateCcw size={13} /> Reset
              </button>
            </div>
            <div className="audioTrack">
              <span>Audio · original</span>
            </div>
          </div>
        </section>

        <aside className="inspector">
          <div className="inspectorHead">
            <b>{tool}</b>
            <span>Inspector</span>
          </div>

          {tool === "AI Edit" ? (
            <div className="inspectorBody">
              <div className="aiMini">
                <WandSparkles size={19} />
                <b>CreatorHub AI</b>
              </div>
              <p>
                Apply simple edit decisions without an external AI key.
              </p>
              <button className="primary full" onClick={autoCut}>
                <Sparkles size={16} /> Auto Cut
              </button>
            </div>
          ) : tool === "Captions" ? (
            <div className="inspectorBody">
              <p>Add a caption overlay.</p>
              <textarea
                className="captionInput"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Type your caption..."
              />
            </div>
          ) : tool === "Zoom" ? (
            <div className="inspectorBody">
              <p>Adjust the preview zoom.</p>
              <input
                className="scrubber"
                type="range"
                min="1"
                max="1.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
              <div className="setting">
                <span>Zoom</span>
                <b>{zoom.toFixed(2)}x</b>
              </div>
            </div>
          ) : tool === "Audio" ? (
            <div className="inspectorBody">
              <p>Control the original audio track.</p>
              <button
                className="secondary full"
                onClick={() => {
                  const next = !muted;
                  setMuted(next);
                  if (videoRef.current) videoRef.current.muted = next;
                }}
              >
                {muted ? "Unmute" : "Mute"} original audio
              </button>
            </div>
          ) : tool === "Crop" ? (
            <div className="inspectorBody">
              <p>Crop preview is centered and keeps the source aspect ratio.</p>
              <div className="setting">
                <span>Mode</span>
                <b>Center</b>
              </div>
            </div>
          ) : (
            <div className="inspectorBody">
              <p>
                Trim the clip by setting start and end points on the timeline.
              </p>
              <div className="setting">
                <span>Start</span>
                <b>{formatTime(start)}</b>
              </div>
              <div className="setting">
                <span>End</span>
                <b>{formatTime(end)}</b>
              </div>
              <button className="secondary full" onClick={autoCut}>
                <Sparkles size={15} /> Smart trim
              </button>
            </div>
          )}
        </aside>
      </section>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </main>
  );
}
