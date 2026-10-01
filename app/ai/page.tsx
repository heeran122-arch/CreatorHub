"use client";

import { useState } from "react";
import { Sparkles, WandSparkles, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

type Result = {
  title: string;
  hook: string;
  caption: string;
  suggestions: string[];
};

export default function CreatorAIPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function runAI() {
    if (!prompt.trim()) return;
    setLoading(true);
    setCopied(false);
    try {
      const response = await fetch("/api/creator-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (response.ok) setResult(data.result);
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    if (!result) return;
    await navigator.clipboard.writeText(
      `Title: ${result.title}\nHook: ${result.hook}\nCaption: ${result.caption}\n\nEdit suggestions:\n${result.suggestions.map((x) => "• " + x).join("\n")}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="aiPage">
      <div className="aiTop">
        <Link href="/" className="back"><ArrowLeft size={17}/> Dashboard</Link>
        <span className="aiBadge"><Sparkles size={14}/> CreatorHub AI</span>
      </div>
      <section className="aiHero">
        <div className="aiIcon"><WandSparkles size={30}/></div>
        <h1>Your creator copilot.</h1>
        <p>Describe your video and CreatorHub AI turns the idea into a title, hook, caption, and editing plan.</p>
      </section>

      <section className="aiCard">
        <label>What are you creating?</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: A Roblox LifeSim trailer showing the new Seattle highway update"
          rows={5}
        />
        <div className="aiActions">
          <span>Free CreatorHub AI engine</span>
          <button className="primary" onClick={runAI} disabled={loading || !prompt.trim()}>
            <WandSparkles size={17}/>{loading ? "Thinking..." : "Generate"}
          </button>
        </div>
      </section>

      {result && <section className="resultGrid">
        <div className="resultMain">
          <div className="resultHeader"><div><span className="eyebrow">GENERATED</span><h2>Ready to create</h2></div><button className="iconBtn" onClick={copyAll}>{copied ? <Check size={18}/> : <Copy size={18}/>}</button></div>
          <div className="resultBlock"><small>TITLE</small><h3>{result.title}</h3></div>
          <div className="resultBlock"><small>HOOK</small><p>{result.hook}</p></div>
          <div className="resultBlock"><small>CAPTION</small><p>{result.caption}</p></div>
        </div>
        <div className="resultSide">
          <span className="eyebrow">EDIT PLAN</span>
          <h3>Make the video move.</h3>
          <ul>{result.suggestions.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>}
    </main>
  );
}
