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
        duration: 2000,
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
    <div className="apple-card p-10 md:p-12 text-center flex flex-col items-center justify-center space-y-5">
      {/* Apple Radar Activity Reticle */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Static Concentric Circles */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="14" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          
          {/* Crosshairs */}
          <line x1="50" y1="6" x2="50" y2="94" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          <line x1="6" y1="50" x2="94" y2="50" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

          {/* Expanding Radar Pulse Ring */}
          <circle ref={ringRef} cx="50" cy="50" r="18" fill="none" stroke="#0a84ff" strokeWidth="1.5" opacity="0.85" />

          {/* Rotating Scanner Needle */}
          <g ref={sweepRef} style={{ transformOrigin: "50px 50px" }}>
            <line x1="50" y1="50" x2="50" y2="8" stroke="#0a84ff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="9" r="3" fill="#0a84ff" />
          </g>

          {/* Center Target Dot */}
          <circle cx="50" cy="50" r="3.5" fill="#0a84ff" />
        </svg>
      </div>

      <div className="space-y-1.5 max-w-md">
        <h4 className="text-sm font-semibold text-white tracking-tight">
          {message}
        </h4>
        <p className="text-xs text-white/50 leading-relaxed font-normal">
          {submessage}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#30d158] bg-[#30d158]/10 border border-[#30d158]/25 px-3.5 py-1 rounded-full pt-1">
        <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
        <span>Heuristic &amp; ML Inspection Active</span>
      </div>
    </div>
  );
};
