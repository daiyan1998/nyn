"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Ports the original site's GSAP behaviour. Render once per page; it animates
 * whatever of these it finds: the hero entrance, `.reveal` elements, the
 * parallax image and the stitch rail. Everything is reverted on unmount.
 */
export function PageMotion() {
  useGSAP(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* stitch rail draws with page scroll */
    const stitch = document.getElementById("stitch-path");
    if (stitch) {
      gsap.fromTo(
        stitch,
        { strokeDashoffset: 100 },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
          },
        },
      );
    }

    if (reduceMotion) {
      gsap.set(".reveal", { opacity: 1, y: 0 });
      return;
    }

    /* hero entrance */
    if (document.getElementById("hero")) {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to("#hero h1", { opacity: 1, y: 0, duration: 1.1, delay: 0.15 })
        .to("#hero .hero-sub", { opacity: 1, y: 0, duration: 0.9 }, "-=.7")
        .to("#hero .scroll-cue", { opacity: 1, y: 0, duration: 0.9 }, "-=.7");
    }

    /* generic reveal-on-scroll */
    gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
      if (el.closest("#hero")) return;
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    /* parallax image — moves with scroll, never pins */
    const pxImg = document.getElementById("parallax-img");
    if (pxImg) {
      gsap.to(pxImg, {
        yPercent: -14,
        ease: "none",
        scrollTrigger: {
          trigger: "#parallax",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // Late-loading images change layout; recompute trigger positions.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = window.setTimeout(refresh, 800);
    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
    };
  });

  return null;
}
