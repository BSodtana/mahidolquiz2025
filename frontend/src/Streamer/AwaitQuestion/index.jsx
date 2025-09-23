import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import background from "../../../src/assets/background.png";
import logo from "../../../src/assets/logo_mquiz2025.png";
import '../../css/index.css'

const CLIP_ID = "streamer-welcome-blob-clip";
const GOO_ID = "streamer-welcome-goo";

const PETAL_SEEDS = Array.from({ length: 42 }, (_, index) => {
  const angle = ((index * 43) % 360) * (Math.PI / 180);
  const radius = 50 + (index % 6) * 22;
  return {
    id: `petal-${index}`,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    scale: 0.55 + (index % 4) * 0.12,
    rotation: (index * 17) % 360,
    opacity: 0.55 + ((index % 3) * 0.12),
    hue: (index * 25) % 360,
  };
});

const makePetal = (seed) => (
  <path
    key={seed.id}
    d="M0 0 C 12 -26 34 -24 42 -2 C 38 18 12 22 0 0 Z"
    fill={`hsl(${seed.hue} 82% 78% / ${seed.opacity})`}
    transform={`translate(${seed.x}, ${seed.y}) rotate(${seed.rotation}) scale(${seed.scale})`}
  />
);

const HourglassIcon = forwardRef(function HourglassIcon(props, ref) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <g
        stroke="#0B3D91"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 12h48" />
        <path d="M24 84h48" />
        <path d="M30 12v18c0 11 18 20 18 20s18-9 18-20V12" />
        <path d="M30 84V66c0-11 18-20 18-20s18 9 18 20v18" />
      </g>
      <path d="M33 12h30v18c0 9-15 16-15 16s-15-7-15-16V12z" fill="#5FD0D7" />
      <path d="M33 84h30V66c0-9-15-16-15-16s-15 7-15 16v18z" fill="#1692C6" />
    </svg>
  );
});

export default function StreamerWelcome({ durationBase = 1, onFinished }) {
  const [introDone, setIntroDone] = useState(false);

  const rootRef = useRef(null);
  const overlayRef = useRef(null);
  const revealBgRef = useRef(null);
  const logoRef = useRef(null);
  const cardRef = useRef(null);
  const blobRef = useRef(null);
  const petalsRef = useRef(null);
  const bokehRef = useRef(null);
  const hourglassRef = useRef(null);
  const timelineRef = useRef(null);
  const finalisedRef = useRef(false);

  const petals = useMemo(() => PETAL_SEEDS.map(makePetal), []);

  const finalise = (invokeCallback = true) => {
    if (finalisedRef.current) return;
    finalisedRef.current = true;
    timelineRef.current?.kill();
    gsap.set(overlayRef.current, { autoAlpha: 0 });
    gsap.set([petalsRef.current, bokehRef.current], { autoAlpha: 0 });
    gsap.set(blobRef.current, { autoAlpha: 0, scale: 2.4 });
    gsap.set(revealBgRef.current, { autoAlpha: 0, filter: "none", clipPath: "none" });
    gsap.set(logoRef.current, { autoAlpha: 1, scale: 1, rotation: 0 });
    gsap.set(cardRef.current, {
      autoAlpha: 1,
      y: 0,
      boxShadow: "0 35px 60px -24px rgba(16,24,40,0.45)",
    });
    gsap.set(hourglassRef.current, { rotation: 0 });
    setIntroDone(true);
    if (invokeCallback) onFinished?.();
  };

  useEffect(() => {
    if (!rootRef.current) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      finalise(false);
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    timelineRef.current = tl;

    gsap.set(overlayRef.current, { autoAlpha: 1, backgroundColor: "#000" });
    gsap.set(revealBgRef.current, {
      filter: "blur(15px)",
      clipPath: `url(#${CLIP_ID})`,
    });
    gsap.set(blobRef.current, { scale: 0.3, transformOrigin: "50% 50%" });
    gsap.set([logoRef.current, cardRef.current], { autoAlpha: 0 });
    gsap.set(cardRef.current, { y: 24 });
    gsap.set(bokehRef.current, { autoAlpha: 0 });
    gsap.set(hourglassRef.current, { rotation: -12 });

    const petalPaths = petalsRef.current?.querySelectorAll("path") ?? [];
    gsap.set(petalPaths, {
      autoAlpha: 0,
      y: 240,
      x: 0,
      scale: 0.3,
    });

    tl.to(overlayRef.current, { autoAlpha: 0, duration: 0.6 * durationBase }, 0)
      .to(blobRef.current, { scale: 1.4, duration: 0.6 * durationBase }, 0)
      .to(
        revealBgRef.current,
        { filter: "blur(0px)", duration: 0.9 * durationBase },
        0.5 * durationBase
      )
      .to(
        petalPaths,
        {
          autoAlpha: 1,
          y: -200,
          x: (_, i) => (i % 2 ? -1 : 1) * 280,
          scale: 0.7,
          duration: 0.9 * durationBase,
          stagger: { amount: 0.6 * durationBase, from: "center" },
        },
        0.5 * durationBase
      )
      .fromTo(
        logoRef.current,
        { autoAlpha: 0, scale: 0.6, rotation: -8 },
        {
          autoAlpha: 1,
          scale: 1.05,
          rotation: 3,
          duration: 0.6 * durationBase,
          ease: "back.out(1.8)",
        },
        1.4 * durationBase
      )
      .to(
        logoRef.current,
        { scale: 1, rotation: 0, duration: 0.4 * durationBase },
        2 * durationBase
      )
      .to(bokehRef.current, { autoAlpha: 1, duration: 0.6 * durationBase }, 1.4 * durationBase)
      .fromTo(
        bokehRef.current?.querySelectorAll("circle"),
        { attr: { r: 0 }, autoAlpha: 0 },
        {
          attr: { r: (_, i) => 12 + (i % 3) * 4 },
          autoAlpha: 0.6,
          stagger: 0.08 * durationBase,
          duration: 1 * durationBase,
        },
        1.5 * durationBase
      )
      .to(
        cardRef.current,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8 * durationBase,
        },
        2.4 * durationBase
      )
      .to(
        petalPaths,
        {
          autoAlpha: (_, i) => (i < 10 ? 0.5 : 0),
          duration: 0.6 * durationBase,
        },
        3.2 * durationBase
      )
      .to(revealBgRef.current, { autoAlpha: 0, duration: 0.6 * durationBase }, 3 * durationBase)
      .to(hourglassRef.current, { rotation: 0, duration: 0.4 * durationBase }, 3.2 * durationBase)
      .call(() => finalise(true));

    return () => {
      tl.kill();
    };
  }, [durationBase]);

  return (
    <div
      ref={rootRef}
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden text-slate-800"
    >
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 z-40 bg-black"
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        ref={revealBgRef}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <filter id={GOO_ID}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -8"
            />
          </filter>
          <clipPath id={CLIP_ID} clipPathUnits="objectBoundingBox">
            <path
              ref={blobRef}
              d="M0.5 0.05 C 0.8 0.08, 1.05 0.35, 1 0.65 C 0.94 0.92, 0.6 1, 0.35 0.95 C 0.12 0.9, 0 0.6, 0.05 0.35 C 0.1 0.1, 0.2 0.02, 0.5 0.05 Z"
            />
          </clipPath>
        </defs>
      </svg>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1600 900"
          ref={petalsRef}
          style={{ filter: `url(#${GOO_ID})` }}
        >
          <g transform="translate(800 720)">{petals}</g>
        </svg>
      </div>

      <svg
        ref={bokehRef}
        className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen"
        viewBox="0 0 1600 900"
      >
        {Array.from({ length: 16 }, (_, index) => (
          <circle
            key={`bokeh-${index}`}
            cx={200 + index * 90}
            cy={200 + ((index * 97) % 400)}
            r="22"
            fill="#ffffff"
            opacity="0.4"
          />
        ))}
      </svg>

      <img
        ref={logoRef}
        src={logo}
        alt="Mahidol Quiz"
        className="relative z-15 h-[28vh] min-h-[320px] max-h-[400px] drop-shadow-[0_15px_30px_rgba(15,23,42,0.35)]"
        style={{ pointerEvents: "none" }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[160px]" />

      <div
        ref={cardRef}
        className="relative z-10 mt-8 max-w-4xl bg-white rounded-3xl px-12 py-10 text-center"
        
      >
        <p className="text-4xl font-bold text-slate-900">
          การแข่งขันตอบปัญหามหิดล ประจำปีการศึกษา 2568
        </p>
        <p className="mt-4 text-2xl text-slate-600">
          ณ หอประชุมมหาวิทยาลัยเชียงใหม่ · 27-28 กันยายน 2568
        </p>
        <div className="mt-6 flex items-center justify-center gap-3 text-lg uppercase tracking-[0.3em] text-slate-500">
          <span>รอการเริ่มการแข่งขัน</span>
          <HourglassIcon ref={hourglassRef} className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
