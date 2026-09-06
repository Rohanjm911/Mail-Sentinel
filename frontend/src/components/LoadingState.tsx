import React, { useEffect, useRef } from "react";
import { animate } from "animejs";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Analyzing Email Threats...",
  submessage = "Running multi-pillar security inspection (ML inference, domain spoofing, URL heuristics, RFC headers)",
}) => {
  const sweepRef = useRef<SVGGElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let animSweep: any = null;
    let animRing: any = null;

    if (sweepRef.current) {
      animSweep = animate(sweepRef.current, {
        rotate: [0, 360],
        duration: 2200,
        ease: "linear",
        loop: true,
      });
    }

    if (ringRef.current) {
      animRing = animate(ringRef.current, {
        r: [18, 42],
        opacity: [0.85, 0],
        duration: 1800,
        ease: "outQuad",
        loop: true,
      });
    }

    return () => {
      if (animSweep) animSweep.pause();
      if (animRing) animRing.pause();
    };
  }, []);

  return (
    <div className="p-10 text-center bg-[#0d1424] border border-[#1e2d4a] rounded-2xl flex flex-col items-center justify-center space-y-4 shadow-lg shadow-black/30">
      {/* Anime.js Solid Radar Reticle (No Gradients) */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Static Concentric Circles */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="#1e2d4a" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="#1e2d4a" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="14" fill="none" stroke="#1e2d4a" strokeWidth="1" />
          
          {/* Crosshairs */}
          <line x1="50" y1="6" x2="50" y2="94" stroke="#1e2d4a" strokeWidth="1" />
          <line x1="6" y1="50" x2="94" y2="50" stroke="#1e2d4a" strokeWidth="1" />

          {/* Expanding Radar Pulse Ring */}
          <circle ref={ringRef} cx="50" cy="50" r="18" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.85" />

          {/* Rotating Scanner Needle */}
          <g ref={sweepRef} style={{ transformOrigin: "50px 50px" }}>
            <line x1="50" y1="50" x2="50" y2="8" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="9" r="3" fill="#38bdf8" />
          </g>

          {/* Center Target Dot */}
          <circle cx="50" cy="50" r="3.5" fill="#38bdf8" />
        </svg>
      </div>

      <div className="space-y-1.5 max-w-md">
        <h4 className="text-sm font-bold font-mono text-slate-100 tracking-wide">
          {message}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          {submessage}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full pt-1">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Heuristic &amp; ML Inspection Active</span>
      </div>
    </div>
  );
};
