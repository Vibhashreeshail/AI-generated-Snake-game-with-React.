import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal } from 'lucide-react';

const TRACKS = [
  {
    title: "AUDIO_STREAM_01",
    artist: "SYS.AUDIO.DAEMON",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "AUDIO_STREAM_02",
    artist: "SYS.AUDIO.DAEMON",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title: "AUDIO_STREAM_03",
    artist: "SYS.AUDIO.DAEMON",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== 'AbortError') {
            console.error("Playback failed:", e);
          }
        });
      }
    }
  }, [currentTrackIndex, isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError') {
              console.error("Playback failed:", e);
            }
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleEnded = () => {
    nextTrack();
  };

  return (
    <div className="bg-black border-2 border-cyan-500 p-6 shadow-[4px_4px_0_#f0f] w-full max-w-md mx-auto flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 opacity-50 screen-tear" />
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div className="w-16 h-16 bg-black border-2 border-fuchsia-500 flex items-center justify-center mb-4 shadow-[2px_2px_0_#0ff]">
        <Terminal className="w-8 h-8 text-fuchsia-500" />
      </div>

      <h3 
        className="text-cyan-400 font-bold text-2xl tracking-widest mb-1 text-center truncate w-full glitch-text"
        data-text={currentTrack.title}
      >
        {currentTrack.title}
      </h3>
      <p className="text-fuchsia-500 text-sm mb-6 uppercase tracking-[0.3em]">
        {currentTrack.artist}
      </p>

      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={prevTrack}
          className="text-cyan-500 hover:text-fuchsia-500 transition-colors hover:scale-110 active:scale-95"
        >
          <SkipBack className="w-8 h-8" />
        </button>
        
        <button
          onClick={togglePlay}
          className="w-16 h-16 bg-cyan-500 text-black flex items-center justify-center hover:bg-fuchsia-500 transition-colors shadow-[4px_4px_0_#000] border-2 border-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000]"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-black" />
          ) : (
            <Play className="w-8 h-8 fill-black ml-1" />
          )}
        </button>

        <button
          onClick={nextTrack}
          className="text-cyan-500 hover:text-fuchsia-500 transition-colors hover:scale-110 active:scale-95"
        >
          <SkipForward className="w-8 h-8" />
        </button>
      </div>

      <div className="flex items-center w-full gap-3 px-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-fuchsia-500 hover:text-cyan-400 transition-colors"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (isMuted) setIsMuted(false);
          }}
          className="w-full h-2 bg-black border border-cyan-500 appearance-none cursor-pointer accent-fuchsia-500"
        />
      </div>
    </div>
  );
}
