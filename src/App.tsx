/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-cyan-400 font-mono overflow-hidden relative selection:bg-fuchsia-500/30 static-noise scanlines">
      {/* Background Grid & Glow Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
        
        {/* Left/Top: Music Player */}
        <div className="w-full lg:w-1/3 flex flex-col items-center justify-center order-2 lg:order-1">
          <div className="mb-8 text-center">
            <h1 
              className="text-5xl md:text-6xl font-black tracking-tighter text-cyan-400 drop-shadow-[2px_2px_0_#f0f] mb-2 glitch-text uppercase"
              data-text="SYS.TERMINAL"
            >
              SYS.TERMINAL
            </h1>
            <p className="text-fuchsia-400 text-lg uppercase tracking-[0.3em] font-semibold">
              // SECTOR: ENTERTAINMENT
            </p>
          </div>
          <MusicPlayer />
        </div>

        {/* Right/Bottom: Snake Game */}
        <div className="w-full lg:w-auto flex justify-center order-1 lg:order-2">
          <SnakeGame />
        </div>

      </div>
    </div>
  );
}
