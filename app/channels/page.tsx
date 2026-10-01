"use client";

import Link from "next/link";
import { ArrowLeft, Link2, Clock3 } from "lucide-react";

export default function Channels() {
  return (
    <main className="pageShell">
      <header className="pageTop">
        <Link href="/" className="back">
          <ArrowLeft size={17} /> Dashboard
        </Link>
        <div className="pageTitle">
          <Link2 size={18} />
          <b>Channels</b>
        </div>
        <span />
      </header>

      <section className="pageContent">
        <div className="pageIntro">
          <div>
            <span className="eyebrow">PUBLISHING</span>
            <h1>Publishing integrations</h1>
            <p>
              YouTube, Instagram, and TikTok connections are turned off for
              now. We can add official sign-in and publishing later.
            </p>
          </div>
        </div>

        <div className="channelGrid">
          {["YouTube", "Instagram", "TikTok"].map((name) => (
            <article className="channelCard" key={name}>
              <div className="channelIcon">
                <Clock3 />
              </div>
              <div>
                <h3>{name}</h3>
                <p>Coming later. No account connection is active.</p>
              </div>
              <span className="secondary">Coming later</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
