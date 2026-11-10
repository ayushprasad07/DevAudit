"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Bookmark, ChevronLeft, ChevronRight, FileText, ScanSearch, ShieldCheck } from "lucide-react"

/*
 * Audit Orbit Carousel: the active audit module sits on the left; changing
 * module swings it out over the top on a wide orbit while the next one swings
 * in. The page scrolls normally past this section. The module changes only
 * through arrows, thumbnails, dots, arrow keys and swipes.
 *
 * Layout: a fixed 960 x 520 canvas scaled to fit on wide containers, and a
 * stacked, natural-height layout below 860px (tablets and phones).
 */

export type AuditModule = {
  /** Thin first title line, e.g. "Dependency". */
  title: string
  /** Heavy second title line, e.g. "Intelligence". */
  subtitle: string
  /** Square image, shown as a circular disc. */
  image: string
  alt?: string
  /** Small line above the title. Defaults to "#n Audit signal". */
  eyebrow?: string
  /** Two-line label under the thumbnail. Defaults to title + subtitle. */
  label?: string
  /** Who this module is most useful to, e.g. "For engineering". */
  audience: string
  /** What it inspects, shown under the audience line. */
  scope?: string
  /** Elaborated feature description (Overview tab). */
  description: string
  /** Short pill shown at the bottom of the card. */
  highlight: string
  /** Concrete checks (Checks tab). */
  checks?: string[]
  /** Badge and arc colour: hex or rgb(). */
  accent: string
}

export type AuditOrbitCarouselProps = {
  modules: AuditModule[]
  /** Desktop section height. A definite length, e.g. "100svh" or "720px". Ignored on small screens. */
  height?: string
  /** Optional photo behind the display, washed by the theme background. */
  backdrop?: string
  /** Arrows wrap from last to first and back. */
  loop?: boolean
  /** CSS font-family value, e.g. "var(--font-outfit)". */
  fontFamily?: string
  onReport?: (module: AuditModule, index: number) => void
  onRun?: (module: AuditModule, index: number) => void
  onChange?: (index: number) => void
  className?: string
}

// #region helpers
export function wrapIndex(i: number, n: number): number {
  if (n <= 0) return 0
  return ((Math.round(i) % n) + n) % n
}

/** Which way to swing when jumping: the shorter way round. */
export function stepDirection(from: number, to: number, n: number): 1 | -1 {
  if (n <= 0) return 1
  const fwd = (((to - from) % n) + n) % n
  return fwd <= n - fwd ? 1 : -1
}

/** First thumbnail shown in the strip window, keeping the current one in view. */
export function stripStart(index: number, n: number, visible: number): number {
  if (n <= visible) return 0
  return Math.max(0, Math.min(index - 1, n - visible))
}

/** Title font size so a line of `chars` characters fits `width` px at `em` average glyph width. */
export function fitSize(chars: number, max: number, width: number, em: number): number {
  return Math.min(max, width / (Math.max(1, chars) * em))
}

/** The tinted band: a thick stroke along the orbit circle, tapering at both ends. Angles in degrees. */
export function arcPath(a0: number, a1: number, cx: number, cy: number, r: number, w: number, steps = 48): string {
  const outer: string[] = []
  const inner: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = ((a0 + (a1 - a0) * t) * Math.PI) / 180
    const h = (w / 2) * Math.pow(Math.sin(Math.PI * t), 0.45)
    const c = Math.cos(a)
    const s = Math.sin(a)
    outer.push((cx + c * (r + h)).toFixed(1) + " " + (cy + s * (r + h)).toFixed(1))
    inner.push((cx + c * (r - h)).toFixed(1) + " " + (cy + s * (r - h)).toFixed(1))
  }
  return "M" + outer.join("L") + "L" + inner.reverse().join("L") + "Z"
}

/** Where the band rests for each module, as [start, end] angles. Cycles if there are more modules. */
export const ARC_REST = [[50, 98], [46, 124], [60, 126], [40, 100], [54, 112], [44, 104]]
export function arcRest(index: number): number[] {
  return ARC_REST[((index % ARC_REST.length) + ARC_REST.length) % ARC_REST.length]
}

/** The band mid-swap. */
export const ARC_SWEEP = [38, 146]
// #endregion

const ORBIT_X = 299
const ORBIT_Y = -450
const ORBIT_R = 650
const SWING = 50 // degrees the disc travels round the orbit's pivot
const ITEM = 118 // thumbnail pitch in canvas px
const VISIBLE = 4

const CSS = `
.dsh-wrap{width:100%;container-type:inline-size;container-name:dsh}
.dsh-root{--b:var(--dsh-bg,#000);--f:var(--dsh-fg,#fafafa);--m:var(--dsh-muted,#a3a3a3);--p:var(--dsh-primary,#fb923c);
position:relative;overflow:hidden;width:100%;background:var(--b);color:var(--f);
font-family:var(--dsh-font,ui-sans-serif),ui-sans-serif,system-ui,sans-serif;-webkit-tap-highlight-color:transparent}
.dsh-root *{box-sizing:border-box}
.dsh-bd{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;pointer-events:none}
.dsh-wash{position:absolute;inset:0;background:color-mix(in oklab,var(--b) 38%,transparent);pointer-events:none}
.dsh-dim{position:absolute;inset:0;background:var(--b);opacity:.82;pointer-events:none}
.dsh-grid{position:absolute;inset:0;opacity:.5;pointer-events:none;
background-image:linear-gradient(to right,#52525b14 1px,transparent 1px),linear-gradient(to bottom,#52525b14 1px,transparent 1px);background-size:48px 48px}
.dsh-root:focus-visible{outline:2px solid var(--p);outline-offset:-4px}
.dsh-canvas{position:absolute;left:50%;top:50%;width:960px;height:520px;transform:translate(-50%,-50%) scale(var(--dsh-s,1));transform-origin:50% 50%}
.dsh-arc{position:absolute;left:0;top:0;width:960px;height:520px;overflow:visible;pointer-events:none}
.dsh-btn{appearance:none;border:0;background:none;color:inherit;font:inherit;padding:0;margin:0;cursor:pointer}
.dsh-btn:focus-visible{outline:2px solid var(--p);outline-offset:3px;border-radius:10px}
.dsh-ico{width:22px;height:22px}
.dsh-pager{position:absolute;left:76px;top:172px;display:flex;flex-direction:column;align-items:center;gap:7px}
.dsh-dot{width:14px;height:10px;display:grid;place-items:center;transition:height .45s cubic-bezier(.3,.7,.2,1)}
.dsh-dot i{display:block;width:3px;height:3px;border-radius:3px;background:var(--f);opacity:.45;transition:height .45s cubic-bezier(.3,.7,.2,1),opacity .3s}
.dsh-dot[aria-current] i{height:22px;opacity:.9;background:var(--p)}
.dsh-dot[aria-current]{height:26px}
.dsh-plates{position:absolute;left:130px;top:82px;width:245px;height:245px;touch-action:pan-y}
.dsh-orbit{position:absolute;inset:0;transform-origin:69% -217%;visibility:hidden;will-change:transform}
.dsh-orbit>img{display:block;width:100%;height:100%;max-width:none;object-fit:cover;border-radius:50%;user-select:none;-webkit-user-drag:none;
border:1px solid color-mix(in oklab,var(--f) 14%,transparent);
box-shadow:0 0 0 8px color-mix(in oklab,var(--f) 5%,transparent),0 24px 60px -18px var(--glow,#fb923c),0 16px 30px -10px rgba(0,0,0,.7)}
.dsh-head{position:absolute;left:388px;top:96px;width:330px;height:150px}
.dsh-hd{position:absolute;inset:0;visibility:hidden}
.dsh-eye{font-size:12.5px;font-weight:600;letter-spacing:.01em;margin:0 0 4px 2px;color:var(--p)}
.dsh-t1,.dsh-t2{display:block;white-space:nowrap;line-height:1;text-transform:uppercase;margin:0}
.dsh-t1{font-weight:200;letter-spacing:-.015em;margin-top:6px}
.dsh-t2{font-weight:800;letter-spacing:-.025em;margin-top:6px;color:color-mix(in oklab,var(--f) 90%,transparent)}
.dsh-acts{position:absolute;left:396px;top:280px;display:flex;gap:44px;font-size:12.5px;font-weight:500}
.dsh-acts .dsh-btn{display:flex;align-items:center;gap:9px;padding:4px 0}
.dsh-acts .dsh-ico{width:15px;height:15px;color:var(--p)}
.dsh-card{position:absolute;left:722px;top:117px;width:223px;padding:18px 20px 20px;border-radius:20px;
background:color-mix(in oklab,var(--f) 5%,transparent);border:1px solid color-mix(in oklab,var(--f) 10%,transparent);
-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 18px 40px -24px rgba(0,0,0,.6)}
.dsh-tabs{display:flex;justify-content:space-between;padding:0 6px 0 20px;font-size:12px;margin-bottom:18px}
.dsh-tab{color:var(--m);font-weight:500;padding:3px 0}
.dsh-tab[aria-selected=true]{color:var(--f);font-weight:600}
.dsh-bodies{display:grid}
.dsh-body{grid-area:1/1;visibility:hidden}
.dsh-rate{position:relative;height:62px;margin:0 0 14px 6px}
.dsh-badge{position:absolute;left:0;top:0;width:46px;height:62px;border-radius:10px}
.dsh-badge svg{position:absolute;left:16px;bottom:8px;width:14px;height:14px;color:#0a0a0a}
.dsh-num{position:absolute;left:8px;top:6px;font-size:30px;font-weight:700;letter-spacing:-.04em;line-height:1;color:#0a0a0a}
.dsh-aud{font-size:17px;font-weight:600;letter-spacing:-.01em;margin:0}
.dsh-kit{font-size:10.5px;color:var(--m);margin:3px 0 12px}
.dsh-desc{font-size:12px;line-height:1.4;margin:0;min-height:112px;color:color-mix(in oklab,var(--f) 82%,transparent)}
.dsh-ing{display:flex;flex-wrap:wrap;gap:5px;margin:0;padding:0;list-style:none;min-height:112px;align-content:flex-start}
.dsh-ing li{font-size:11px;padding:4px 9px;border-radius:99px;background:color-mix(in oklab,var(--f) 8%,transparent)}
.dsh-react{display:flex;gap:10px;margin-top:16px;align-items:center}
.dsh-pill{display:flex;align-items:center;height:34px;padding:0 12px;border-radius:99px;font-size:10.5px;flex:1;min-width:0;
background:color-mix(in oklab,var(--p) 14%,transparent);color:var(--p);border:1px solid color-mix(in oklab,var(--p) 30%,transparent)}
.dsh-save{width:34px;height:34px;display:grid;place-items:center;border-radius:99px;flex:none;background:color-mix(in oklab,var(--f) 8%,transparent)}
.dsh-react .dsh-ico{width:16px;height:16px}
.dsh-react [aria-pressed=true] .dsh-ico{fill:currentColor}
.dsh-strip{position:absolute;left:130px;top:362px;width:550px;height:122px;display:flex;align-items:center}
.dsh-arrow{width:36px;height:36px;display:grid;place-items:center;flex:none}
.dsh-arrow svg{width:12px;height:16px;fill:currentColor}
.dsh-win{position:relative;width:${ITEM * VISIBLE}px;height:122px;overflow:hidden;flex:none;margin:0 2px;
-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent);mask-image:linear-gradient(90deg,#000 88%,transparent)}
.dsh-track{position:absolute;left:0;top:0;display:flex;transition:transform .6s cubic-bezier(.65,0,.35,1)}
.dsh-th{width:${ITEM}px;height:122px;display:flex;justify-content:center;padding-top:3px}
.dsh-th .dsh-btn{width:80px;height:116px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:7px;padding-top:9px;transition:background .45s}
.dsh-th .dsh-btn[aria-current]{background:color-mix(in oklab,var(--f) 7%,transparent);box-shadow:0 10px 24px -16px rgba(0,0,0,.8);border:1px solid color-mix(in oklab,var(--p) 35%,transparent)}
.dsh-th img{width:56px;height:56px;max-width:none;object-fit:cover;border-radius:50%;transition:transform .45s}
.dsh-th .dsh-btn[aria-current] img{transform:scale(1.06)}
.dsh-th span{font-size:10px;line-height:1.25;text-align:center;font-weight:500;color:color-mix(in oklab,var(--f) 78%,transparent);max-width:78px}
.dsh-mnav{display:none}
.dsh-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* Tablets and phones: stacked, natural height */
@container dsh (max-width:859px){
.dsh-root{height:auto !important}
.dsh-canvas{position:relative;left:auto;top:auto;width:100%;height:auto;transform:none;display:flex;flex-direction:column;align-items:center;padding:28px 20px 28px}
.dsh-arc{width:220%;height:auto;left:-60%;top:-10px}
.dsh-pager,.dsh-strip{display:none}
.dsh-plates{position:relative;left:auto;top:auto;width:min(62cqw,280px);height:min(62cqw,280px);margin:0 auto}
.dsh-head{position:relative;left:auto;top:auto;width:100%;max-width:420px;height:128px;margin-top:18px}
.dsh-hd{text-align:center;transform:scale(.78);transform-origin:50% 0}
.dsh-eye{margin-left:0}
.dsh-acts{position:relative;left:auto;top:auto;margin-top:6px;gap:12px 28px;flex-wrap:wrap;justify-content:center;font-size:13px}
.dsh-acts .dsh-btn{padding:8px 4px}
.dsh-card{position:relative;left:auto;top:auto;width:100%;max-width:440px;margin-top:18px;padding:18px 18px 18px}
.dsh-tabs{padding:0 6px;justify-content:flex-start;gap:22px;font-size:13px}
.dsh-aud{font-size:18px}
.dsh-kit{font-size:11.5px}
.dsh-desc{font-size:13px;min-height:0}
.dsh-ing{min-height:0}
.dsh-ing li{font-size:12px}
.dsh-pill{font-size:11.5px;height:38px}
.dsh-save{width:38px;height:38px}
.dsh-mnav{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:20px}
.dsh-mbtn{width:42px;height:42px;display:grid;place-items:center;border-radius:99px;
border:1px solid color-mix(in oklab,var(--f) 16%,transparent);background:color-mix(in oklab,var(--f) 6%,transparent)}
.dsh-mbtn .dsh-ico{width:18px;height:18px}
.dsh-mdots{display:flex;align-items:center;gap:6px}
.dsh-mdot{width:22px;height:22px;display:grid;place-items:center}
.dsh-mdot i{display:block;width:6px;height:6px;border-radius:99px;background:var(--f);opacity:.35;transition:width .35s cubic-bezier(.3,.7,.2,1),opacity .3s,background .3s}
.dsh-mdot[aria-current] i{width:20px;opacity:1;background:var(--p)}
}
@container dsh (max-width:380px){
.dsh-canvas{padding:22px 14px 24px}
.dsh-acts{font-size:12.5px;gap:8px 18px}
}
@media (prefers-reduced-motion:reduce){.dsh-track,.dsh-dot,.dsh-dot i,.dsh-mdot i,.dsh-th .dsh-btn,.dsh-th img{transition:none}}
`

const HIDE_1 = "inset(0% 0% 0% 100%)" // thin line: wipes in from the right
const HIDE_2 = "inset(0% 100% 0% 0%)" // heavy line: wipes in from the left
const SHOW = "inset(0% 0% 0% 0%)"

export function AuditOrbitCarousel({
  modules,
  height = "100svh",
  backdrop,
  loop = true,
  fontFamily,
  onReport,
  onRun,
  onChange,
  className,
}: AuditOrbitCarouselProps) {
  const n = modules.length
  const [index, setIndex] = useState(0)
  const [tab, setTab] = useState("overview")
  const [saved, setSaved] = useState({} as Record<number, boolean>)

  const rootRef = useRef(null as HTMLDivElement | null)
  const indexRef = useRef(0)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const orbits = useRef([] as (HTMLDivElement | null)[])
  const heads = useRef([] as (HTMLDivElement | null)[])
  const bodies = useRef([] as (HTMLDivElement | null)[])
  const arcRef = useRef(null as SVGPathElement | null)
  const arc = useRef({ a0: 0, a1: 0 })
  const shown = useRef(-1)
  const dirRef = useRef(1 as 1 | -1)
  const tlRef = useRef(null as gsap.core.Timeline | null)
  const reducedRef = useRef(false)
  const swipe = useRef(null as { x: number; y: number } | null)

  // Fit the 960 x 520 design canvas to the root (desktop layout only; the stacked layout ignores it).
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const fit = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      el.style.setProperty("--dsh-s", String(Math.min(w / 960, h / 520, 1.6)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => (reducedRef.current = mq.matches)
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  // The swap. Every module is in the DOM; GSAP only moves the outgoing and incoming ones.
  useLayoutEffect(() => {
    const from = shown.current
    const to = index
    const parts = (i: number) => {
      const head = heads.current[i]
      return {
        orbit: orbits.current[i],
        head,
        eye: head && head.querySelector(".dsh-eye"),
        t1: head && head.querySelector(".dsh-t1"),
        t2: head && head.querySelector(".dsh-t2"),
        body: bodies.current[i],
      }
    }
    const drawArc = () =>
      arcRef.current?.setAttribute("d", arcPath(arc.current.a0, arc.current.a1, ORBIT_X, ORBIT_Y, ORBIT_R, 118))
    const rest = arcRest(to)
    const tint = modules[to] ? modules[to].accent : "transparent"
    if (tlRef.current) tlRef.current.progress(1).kill()
    const b = parts(to)
    if (from === -1 || from === to || reducedRef.current) {
      for (let i = 0; i < n; i++)
        if (i !== to) {
          const p = parts(i)
          gsap.set([p.orbit, p.head, p.body], { autoAlpha: 0 })
        }
      gsap.set([b.orbit, b.head, b.body, b.eye], { autoAlpha: 1, rotation: 0, y: 0 })
      gsap.set(b.t1, { clipPath: SHOW })
      gsap.set(b.t2, { clipPath: SHOW })
      arc.current.a0 = rest[0]
      arc.current.a1 = rest[1]
      drawArc()
      if (arcRef.current) gsap.set(arcRef.current, { fill: tint })
      shown.current = to
      return
    }
    const a = parts(from)
    const d = dirRef.current
    const tl = gsap.timeline({ onComplete: () => { tlRef.current = null } })
    tlRef.current = tl
    tl.to(a.orbit, { rotation: SWING * d, duration: 0.62, ease: "power2.in" }, 0)
      .set(a.orbit, { autoAlpha: 0, rotation: 0 }, 0.62)
      .fromTo(b.orbit, { autoAlpha: 1, rotation: -SWING * d }, { rotation: 0, duration: 0.95, ease: "power3.out" }, 0.3)
    tl.to(a.t1, { clipPath: HIDE_1, duration: 0.42, ease: "power2.in" }, 0)
      .to(a.t2, { clipPath: HIDE_2, duration: 0.42, ease: "power2.in" }, 0.06)
      .to(a.eye, { autoAlpha: 0, duration: 0.25 }, 0)
      .set(a.head, { autoAlpha: 0 }, 0.5)
      .set(b.head, { autoAlpha: 1 }, 0.5)
      .fromTo(b.eye, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.55)
      .fromTo(b.t1, { clipPath: HIDE_1 }, { clipPath: SHOW, duration: 0.7, ease: "power3.out" }, 0.55)
      .fromTo(b.t2, { clipPath: HIDE_2 }, { clipPath: SHOW, duration: 0.7, ease: "power3.out" }, 0.62)
    tl.to(a.body, { autoAlpha: 0, y: -6, duration: 0.3, ease: "power1.in" }, 0.05).set(b.body, { autoAlpha: 1, y: 0 }, 0.4)
    if (b.body)
      tl.fromTo(b.body.children, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }, 0.4)
    tl.to(arc.current, { a0: ARC_SWEEP[0], a1: ARC_SWEEP[1], duration: 0.6, ease: "power2.inOut", onUpdate: drawArc }, 0)
      .to(arc.current, { a0: rest[0], a1: rest[1], duration: 0.85, ease: "power3.out", onUpdate: drawArc }, 0.6)
    if (arcRef.current) tl.to(arcRef.current, { fill: tint, duration: 1.1, ease: "power1.inOut" }, 0.1)
    shown.current = to
  }, [index, n, modules])

  useEffect(() => () => { tlRef.current?.kill() }, [])

  const select = (next: number, dir: 1 | -1) => {
    if (next === indexRef.current) return
    dirRef.current = dir
    indexRef.current = next
    setIndex(next)
    onChangeRef.current?.(next)
  }

  // Buttons, keys and swipes jump to a module. Page scroll is never touched.
  const go = (to: number, dir?: 1 | -1) => {
    if (n < 2) return
    if (!loop && (to < 0 || to > n - 1)) return
    const next = wrapIndex(to, n)
    if (next === index) return
    select(next, dir ?? stepDirection(index, next, n))
  }
  const step = (d: 1 | -1) => go(index + d, d)

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1) }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1) }
  }
  const onPointerDown = (e: React.PointerEvent) => { swipe.current = { x: e.clientX, y: e.clientY } }
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.4) step(dx < 0 ? 1 : -1)
  }

  const start = stripStart(index, n, VISIBLE)
  const current = modules[index]
  const rootStyle = { height, ...(fontFamily ? { "--dsh-font": fontFamily } : {}) } as React.CSSProperties

  return (
    <div className={"dsh-wrap" + (className ? " " + className : "")}>
      <div
        ref={rootRef}
        className="dsh-root"
        style={rootStyle}
        role="region"
        aria-roledescription="carousel"
        aria-label="Audit signals"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <style>{CSS}</style>
        {backdrop ? <img className="dsh-bd" src={backdrop} alt="" width={1200} height={900} /> : null}
        {backdrop ? <div className="dsh-dim" /> : null}
        {backdrop ? <div className="dsh-wash" /> : null}
        <div className="dsh-grid" />

        <div className="dsh-canvas">
          <svg className="dsh-arc" viewBox="0 0 960 520" aria-hidden="true">
            <path ref={arcRef} style={{ opacity: 0.3 }} />
          </svg>

          {/* Desktop: vertical pager */}
          <div className="dsh-pager" role="tablist" aria-label="Choose a signal">
            {modules.map((m, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                className="dsh-btn dsh-dot"
                aria-selected={i === index}
                aria-current={i === index ? "true" : undefined}
                aria-label={m.title + " " + m.subtitle}
                onClick={() => go(i)}
              >
                <i />
              </button>
            ))}
          </div>

          <div
            className="dsh-plates"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipe.current = null)}
          >
            {modules.map((m, i) => (
              <div key={i} ref={(el) => { orbits.current[i] = el }} className="dsh-orbit" aria-hidden={i !== index}>
                <img
                  src={m.image}
                  alt={m.alt ?? m.title + " " + m.subtitle}
                  width={245}
                  height={245}
                  draggable={false}
                  style={{ "--glow": m.accent } as React.CSSProperties}
                />
              </div>
            ))}
          </div>

          <div className="dsh-head" aria-live="polite">
            {modules.map((m, i) => (
              <div key={i} ref={(el) => { heads.current[i] = el }} className="dsh-hd" aria-hidden={i !== index}>
                <p className="dsh-eye">{m.eyebrow ?? "#" + (i + 1) + " Audit signal"}</p>
                <h2 style={{ margin: 0, font: "inherit" }}>
                  <span className="dsh-t1" style={{ fontSize: fitSize(m.title.length, 56, 330, 0.56) + "px" }}>{m.title}</span>
                  <span className="dsh-t2" style={{ fontSize: fitSize(m.subtitle.length, 62, 320, 0.64) + "px" }}>{m.subtitle}</span>
                </h2>
              </div>
            ))}
          </div>

          <div className="dsh-acts">
            <button type="button" className="dsh-btn" onClick={() => current && onReport?.(current, index)}>
              <FileText className="dsh-ico" strokeWidth={1.8} aria-hidden="true" />
              View sample report
            </button>
            <button type="button" className="dsh-btn" onClick={() => current && onRun?.(current, index)}>
              <ScanSearch className="dsh-ico" strokeWidth={1.8} aria-hidden="true" />
              Run an audit
            </button>
          </div>

          <div className="dsh-card">
            <div className="dsh-tabs" role="tablist" aria-label="Signal details">
              {["overview", "checks"].map((t) => (
                <button key={t} type="button" role="tab" className="dsh-btn dsh-tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                  {t === "overview" ? "Overview" : "Checks"}
                </button>
              ))}
            </div>
            <div className="dsh-bodies">
              {modules.map((m, i) => (
                <div key={i} ref={(el) => { bodies.current[i] = el }} className="dsh-body" aria-hidden={i !== index}>
                  <div className="dsh-rate">
                    <div className="dsh-badge" style={{ background: m.accent }}>
                      <ShieldCheck aria-hidden="true" strokeWidth={2.2} />
                    </div>
                    <span className="dsh-num" aria-label={"Signal " + (i + 1) + " of " + n}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="dsh-aud">{m.audience}</p>
                  <p className="dsh-kit">{m.scope ?? " "}</p>
                  {tab === "overview" || !m.checks?.length ? (
                    <p className="dsh-desc">{m.description}</p>
                  ) : (
                    <ul className="dsh-ing">{m.checks.map((x) => <li key={x}>{x}</li>)}</ul>
                  )}
                  <div className="dsh-react">
                    <span className="dsh-pill">{m.highlight}</span>
                    <button
                      type="button"
                      className="dsh-btn dsh-save"
                      aria-pressed={!!saved[i]}
                      aria-label="Save signal"
                      tabIndex={i === index ? 0 : -1}
                      onClick={() => setSaved((s) => ({ ...s, [i]: !s[i] }))}
                    >
                      <Bookmark className="dsh-ico" strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: thumbnail strip */}
          <div className="dsh-strip">
            <button type="button" className="dsh-btn dsh-arrow" aria-label="Previous signal" onClick={() => step(-1)}>
              <svg viewBox="0 0 12 16" aria-hidden="true"><path d="M11 0v16L0 8z" /></svg>
            </button>
            <div className="dsh-win">
              <div className="dsh-track" style={{ transform: "translateX(" + -start * ITEM + "px)" }}>
                {modules.map((m, i) => (
                  <div key={i} className="dsh-th">
                    <button type="button" className="dsh-btn" aria-current={i === index ? "true" : undefined} onClick={() => go(i)}>
                      <img src={m.image} alt="" width={56} height={56} draggable={false} />
                      <span>{m.label ?? m.title + " " + m.subtitle}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button type="button" className="dsh-btn dsh-arrow" aria-label="Next signal" onClick={() => step(1)}>
              <svg viewBox="0 0 12 16" aria-hidden="true"><path d="M1 0v16l11-8z" /></svg>
            </button>
          </div>

          {/* Tablet and phone: prev / dots / next */}
          <div className="dsh-mnav">
            <button type="button" className="dsh-btn dsh-mbtn" aria-label="Previous signal" onClick={() => step(-1)}>
              <ChevronLeft className="dsh-ico" strokeWidth={2} aria-hidden="true" />
            </button>
            <div className="dsh-mdots">
              {modules.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  className="dsh-btn dsh-mdot"
                  aria-current={i === index ? "true" : undefined}
                  aria-label={m.title + " " + m.subtitle}
                  onClick={() => go(i)}
                >
                  <i />
                </button>
              ))}
            </div>
            <button type="button" className="dsh-btn dsh-mbtn" aria-label="Next signal" onClick={() => step(1)}>
              <ChevronRight className="dsh-ico" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
        <p className="dsh-sr" aria-live="polite">
          {current ? "Signal " + (index + 1) + " of " + n + ": " + current.title + " " + current.subtitle : ""}
        </p>
      </div>
    </div>
  )
}

export default AuditOrbitCarousel