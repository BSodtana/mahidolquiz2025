import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { gsap } from "gsap";

import spriteA from "./item3.png";
import spriteB from "./item4.png";
import spriteC from "./item5.png";
import spriteD from "./item6.png";
import spriteE from "./item7.png";

const FLOWER_SPRITES = [spriteA, spriteB, spriteC, spriteD, spriteE];

const SIZE_CLASSES = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

const VARIANTS = {
  blossom: {
    petal: "hsl(340 82% 80%)",
    center: "hsl(45 92% 56%)",
    leaf: "hsl(140 55% 55%)",
  },
  sunrise: {
    petal: "hsl(18 88% 78%)",
    center: "hsl(42 95% 60%)",
    leaf: "hsl(132 70% 48%)",
  },
  berry: {
    petal: "hsl(300 70% 78%)",
    center: "hsl(50 88% 60%)",
    leaf: "hsl(160 60% 50%)",
  },
};

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const GOLDEN_ANGLE = 137.5;

export const makePollen = (count) => {
  const capped = clamp(count, 1, 12);
  return Array.from({ length: capped }, (_, index) => {
    const angle = ((index * GOLDEN_ANGLE) % 360) * (Math.PI / 180);
    const radius = 16 + (index % 5) * 5;
    const size = 4 + (index % 3);
    return (
      <span
        key={`pollen-${index}`}
        className="absolute block rounded-full bg-white/70 mix-blend-screen pointer-events-none"
        style={{
          width: size,
          height: size,
          left: `calc(50% + ${Math.cos(angle) * radius}px)`,
          top: `calc(50% + ${Math.sin(angle) * radius}px)`,
          opacity: 0,
        }}
      />
    );
  });
};

const Leaf = forwardRef(function Leaf({ flip = false }, ref) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 120 80"
      className={`absolute ${flip ? "-right-6 bottom-6" : "-left-6 bottom-6"} h-16 w-16 md:h-20 md:w-20 pointer-events-none`}
      aria-hidden="true"
    >
      <path
        d="M10 40 C 20 10 70 4 110 20 C 90 55 50 78 14 68 Z"
        fill="var(--leaf)"
        opacity="0.85"
      />
      <path
        d="M16 43 C 38 46 58 38 84 20"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
});

const AnswerFlower = forwardRef(function AnswerFlower(
  {
    spriteIndex = 0,
    useSVG = true,
    size = "md",
    interactive = true,
    ariaLabel = "ดอกไม้",
    variant = "blossom",
    pollenCount = 10,
    className = "",
    tabIndex,
    ...rest
  },
  forwardedRef
) {
  const rootRef = useRef(null);
  const flowerRef = useRef(null);
  const leafRefs = useRef([]);
  const shadowRef = useRef(null);
  const pollenRef = useRef(null);
  const hoverTlRef = useRef(null);
  const pressTlRef = useRef(null);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const sprite = useMemo(() => {
    const clampedIdx = clamp(spriteIndex ?? 0, 0, FLOWER_SPRITES.length - 1);
    return FLOWER_SPRITES[clampedIdx];
  }, [spriteIndex]);

  const colors = VARIANTS[variant] ?? VARIANTS.blossom;
  const pollenElements = useMemo(
    () => makePollen(interactive ? pollenCount : Math.min(pollenCount, 8)),
    [interactive, pollenCount]
  );

  useEffect(() => {
    const root = rootRef.current;
    const flower = flowerRef.current;
    const shadow = shadowRef.current;
    const leaves = leafRefs.current.filter(Boolean);
    const pollenDots = Array.from(pollenRef.current?.children ?? []);

    const animations = [];

    if (!root || !flower || !shadow) {
      return () => {};
    }

    const restore = () => {
      gsap.set(flower, { autoAlpha: 1, scale: 1, rotation: 0 });
      gsap.set(shadow, {
        autoAlpha: 1,
        scale: 1,
        filter: "drop-shadow(0 12px 24px rgba(15,23,42,0.25))",
      });
      leaves.forEach((leaf, idx) => {
        gsap.set(leaf, {
          autoAlpha: 1,
          rotation: idx === 0 ? -6 : 6,
          x: idx === 0 ? -4 : 4,
          y: 0,
        });
      });
      pollenDots.forEach((dot) => {
        gsap.set(dot, { autoAlpha: 0.35, y: 0, x: 0 });
      });
    };

    if (reducedMotion) {
      restore();
      return () => {};
    }

    restore();

    const intro = gsap.timeline({ defaults: { ease: "power2.out" } });
    intro
      .fromTo(
        flower,
        { autoAlpha: 0, scale: 0.8 },
        { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.6)" }
      )
      .fromTo(
        shadow,
        { autoAlpha: 0, scale: 0.7 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          filter: "drop-shadow(0 18px 32px rgba(15,23,42,0.35))",
        },
        "<0.05"
      )
      .from(
        leaves,
        {
          autoAlpha: 0,
          x: (idx) => (idx === 0 ? -20 : 20),
          rotation: (idx) => (idx === 0 ? -18 : 18),
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.06,
        },
        "<0.05"
      );

    animations.push(intro);

    const petalIdle = gsap.to(flower, {
      scale: 1.03,
      duration: 2.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      repeatDelay: 0.6,
    });
    animations.push(petalIdle);

    const leafIdles = leaves.map((leaf, idx) =>
      gsap.to(leaf, {
        rotation: idx === 0 ? "-=4" : "+=4",
        duration: 3 + idx,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })
    );
    animations.push(...leafIdles);

    const pollenAnimations = pollenDots.map((dot, idx) =>
      gsap.to(dot, {
        autoAlpha: 0,
        y: -18 - (idx % 4) * 6,
        x: (idx % 2 ? -1 : 1) * (6 + (idx % 3) * 2),
        duration: 3.2 + (idx % 4) * 0.5,
        ease: "sine.inOut",
        repeat: -1,
        repeatDelay: 1.2,
      })
    );
    animations.push(...pollenAnimations);

    if (interactive) {
      hoverTlRef.current = gsap
        .timeline({ paused: true })
        .to(flower, {
          scale: 1.04,
          rotation: 2,
          duration: 0.3,
          ease: "power2.out",
        })
        .to(
          leaves,
          {
            rotation: (idx) => (idx === 0 ? -10 : 10),
            duration: 0.3,
            ease: "power2.out",
          },
          "<"
        )
        .to(
          shadow,
          {
            filter: "drop-shadow(0 22px 36px rgba(15,23,42,0.28))",
            duration: 0.3,
          },
          "<"
        );

      pressTlRef.current = gsap.timeline({ paused: true }).to(flower, {
        scale: 0.98,
        duration: 0.12,
        ease: "power2.out",
      });

      const handleEnter = () => hoverTlRef.current?.play();
      const handleLeave = () => hoverTlRef.current?.reverse();
      const handleDown = () => pressTlRef.current?.play();
      const handleUp = () => pressTlRef.current?.reverse();
      const handleFocus = () => hoverTlRef.current?.play();
      const handleBlur = () => hoverTlRef.current?.reverse();

      const handlePointerMove = (event) => {
        const rect = root.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width - 0.5;
        const relY = (event.clientY - rect.top) / rect.height - 0.5;
        gsap.to(flower, {
          x: relX * 6,
          y: relY * 6,
          duration: 0.4,
          overwrite: true,
        });
        leaves.forEach((leaf, idx) => {
          gsap.to(leaf, {
            x: relX * (idx === 0 ? -10 : 10),
            y: relY * 10,
            duration: 0.5,
            overwrite: true,
          });
        });
      };

      const handlePointerLeave = () => {
        hoverTlRef.current?.reverse();
        gsap.to(flower, { x: 0, y: 0, duration: 0.5 });
        leaves.forEach((leaf, idx) => {
          gsap.to(leaf, {
            x: idx === 0 ? -4 : 4,
            y: 0,
            duration: 0.5,
          });
        });
      };

      root.addEventListener("pointerenter", handleEnter);
      root.addEventListener("pointerleave", handlePointerLeave);
      root.addEventListener("pointerdown", handleDown);
      root.addEventListener("pointerup", handleUp);
      root.addEventListener("pointercancel", handleUp);
      root.addEventListener("pointermove", handlePointerMove);
      root.addEventListener("focus", handleFocus);
      root.addEventListener("blur", handleBlur);

      animations.push({
        kill() {
          root.removeEventListener("pointerenter", handleEnter);
          root.removeEventListener("pointerleave", handlePointerLeave);
          root.removeEventListener("pointerdown", handleDown);
          root.removeEventListener("pointerup", handleUp);
          root.removeEventListener("pointercancel", handleUp);
          root.removeEventListener("pointermove", handlePointerMove);
          root.removeEventListener("focus", handleFocus);
          root.removeEventListener("blur", handleBlur);
        },
      });
    }

    return () => {
      animations.forEach((anim) => anim?.kill?.());
    };
  }, [interactive, variant, reducedMotion, pollenCount]);

  const variantStyle = {
    "--petal": colors.petal,
    "--center": colors.center,
    "--leaf": colors.leaf,
  };

  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const spriteExists = Boolean(sprite);

  const assignRoot = (node) => {
    rootRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const resolvedTabIndex = tabIndex ?? (interactive ? 0 : -1);

  return (
    <div
      ref={assignRoot}
      className={`relative inline-flex select-none items-center justify-center ${sizeClass} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${className}`}
      style={variantStyle}
      role="img"
      aria-label={ariaLabel}
      tabIndex={resolvedTabIndex}
      {...rest}
    >
      <div
        ref={shadowRef}
        className="absolute inset-2 rounded-full bg-slate-900/5"
        aria-hidden="true"
      />

      {useSVG || !spriteExists ? (
        <svg
          ref={flowerRef}
          viewBox="0 0 100 100"
          className="relative z-10 h-full w-full"
          aria-hidden="true"
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <path
              key={`petal-${index}`}
              d="M50 16 C 70 8 90 24 82 48 C 78 62 64 74 50 68 C 36 74 22 62 18 48 C 10 24 30 8 50 16 Z"
              fill="var(--petal)"
              transform={`rotate(${index * 72} 50 50)`}
              opacity="0.92"
            />
          ))}
          <circle cx="50" cy="50" r="16" fill="var(--center)" />
        </svg>
      ) : (
        <img
          ref={flowerRef}
          src={sprite}
          alt=""
          className="relative z-10 h-full w-full object-contain"
        />
      )}

      <Leaf ref={(el) => (leafRefs.current[0] = el)} />
      <Leaf ref={(el) => (leafRefs.current[1] = el)} flip />

      <div ref={pollenRef} className="pointer-events-none absolute inset-0">
        {pollenElements}
      </div>
    </div>
  );
});

AnswerFlower.propTypes = {
  spriteIndex: PropTypes.number,
  useSVG: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  interactive: PropTypes.bool,
  ariaLabel: PropTypes.string,
  variant: PropTypes.oneOf(Object.keys(VARIANTS)),
  pollenCount: PropTypes.number,
  className: PropTypes.string,
  tabIndex: PropTypes.number,
};

export default AnswerFlower;
