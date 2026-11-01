import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, ChevronLeft, ChevronRight, House, BriefcaseBusiness, LayoutGrid, Award, MessageCircle } from 'lucide-react'
import { animate, motion, useMotionValue } from 'framer-motion'


// Figma's continuous-corner path construction, adapted from phamfoo/figma-squircle (MIT).
// A ResizeObserver regenerates this path at the element's actual rendered dimensions.
function getSquirclePath(width, height, cornerRadius = 42, cornerSmoothing = 0.75) {
  const budget = Math.min(width, height) / 2
  const radius = Math.min(cornerRadius, budget)
  let p = (1 + cornerSmoothing) * radius
  const preserveSmoothing = true
  if (!preserveSmoothing) {
    const maxSmoothing = budget / radius - 1
    cornerSmoothing = Math.min(cornerSmoothing, maxSmoothing)
    p = Math.min(p, budget)
  }

  const radians = (degrees) => degrees * Math.PI / 180
  const arcMeasure = 90 * (1 - cornerSmoothing)
  const arc = Math.sin(radians(arcMeasure / 2)) * radius * Math.SQRT2
  const alpha = (90 - arcMeasure) / 2
  const p3ToP4 = radius * Math.tan(radians(alpha / 2))
  const beta = radians(45 * cornerSmoothing)
  const c = p3ToP4 * Math.cos(beta)
  const d = c * Math.tan(beta)
  let b = (p - arc - c - d) / 3
  let a = 2 * b
  if (preserveSmoothing && p > budget) {
    const available = budget - d - arc - c
    const minA = available / 6
    const maxB = available - minA
    b = Math.min(b, maxB)
    a = available - b
    p = Math.min(p, budget)
  }
  const f = (value) => Number(value.toFixed(4)).toString()

  return [
    `M ${f(width - p)} 0`,
    `c ${f(a)} 0 ${f(a + b)} 0 ${f(a + b + c)} ${f(d)}`,
    `a ${f(radius)} ${f(radius)} 0 0 1 ${f(arc)} ${f(arc)}`,
    `c ${f(d)} ${f(c)} ${f(d)} ${f(b + c)} ${f(d)} ${f(a + b + c)}`,
    `L ${f(width)} ${f(height - p)}`,
    `c 0 ${f(a)} 0 ${f(a + b)} ${f(-d)} ${f(a + b + c)}`,
    `a ${f(radius)} ${f(radius)} 0 0 1 ${f(-arc)} ${f(arc)}`,
    `c ${f(-c)} ${f(d)} ${f(-(b + c))} ${f(d)} ${f(-(a + b + c))} ${f(d)}`,
    `L ${f(p)} ${f(height)}`,
    `c ${f(-a)} 0 ${f(-(a + b))} 0 ${f(-(a + b + c))} ${f(-d)}`,
    `a ${f(radius)} ${f(radius)} 0 0 1 ${f(-arc)} ${f(-arc)}`,
    `c ${f(-d)} ${f(-c)} ${f(-d)} ${f(-(b + c))} ${f(-d)} ${f(-(a + b + c))}`,
    `L 0 ${f(p)}`,
    `c 0 ${f(-a)} 0 ${f(-(a + b))} ${f(d)} ${f(-(a + b + c))}`,
    `a ${f(radius)} ${f(radius)} 0 0 1 ${f(arc)} ${f(-arc)}`,
    `c ${f(c)} ${f(-d)} ${f(b + c)} ${f(-d)} ${f(a + b + c)} ${f(-d)}`,
    'Z',
  ].join(' ')
}

const railFrames = new WeakMap()
const railInertiaFrames = new WeakMap()
function animateRailTo(track, destination, duration = 900, onComplete) {
  if (!track) return
  const previous = railFrames.get(track)
  if (previous) cancelAnimationFrame(previous)
  const start = track.scrollLeft
  const max = Math.max(0, track.scrollWidth - track.clientWidth)
  const target = Math.min(max, Math.max(0, destination))
  const distance = target - start
  if (Math.abs(distance) < 1) { onComplete?.(); return }
  const started = performance.now()
  // Symmetric quintic easing: smooth acceleration and deceleration, no abrupt stop.
  const ease = (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2
  const step = (now) => {
    const progress = Math.min(1, (now - started) / duration)
    track.scrollLeft = start + distance * ease(progress)
    if (progress < 1) railFrames.set(track, requestAnimationFrame(step))
    else {
      railFrames.delete(track)
      onComplete?.()
    }
  }
  railFrames.set(track, requestAnimationFrame(step))
}

function getRailSnapPositions(track) {
  const cards = [...track.children].filter((child) => child.matches('.experience-card, .certification-card, .licenses-record'))
  if (!cards.length) return []
  const style = getComputedStyle(track)
  const scrollPaddingLeft = Number.parseFloat(style.scrollPaddingLeft) || 0
  const scrollPaddingRight = Number.parseFloat(style.scrollPaddingRight) || 0
  const snapportCenter = (track.clientWidth + scrollPaddingLeft - scrollPaddingRight) / 2
  const trackRect = track.getBoundingClientRect()
  const max = Math.max(0, track.scrollWidth - track.clientWidth)
  return cards.map((card) => {
    const cardRect = card.getBoundingClientRect()
    const cardStart = cardRect.left - trackRect.left + track.scrollLeft - track.clientLeft
    const alignment = getComputedStyle(card).scrollSnapAlign
    const snapOffset = alignment.includes('center')
      ? cardRect.width / 2 - snapportCenter
      : -scrollPaddingLeft
    return Math.max(0, Math.min(max,
      cardStart + snapOffset
    ))
  })
}

function cancelRailMotion(track) {
  const animation = railFrames.get(track)
  if (animation) cancelAnimationFrame(animation)
  railFrames.delete(track)
  const inertia = railInertiaFrames.get(track)
  if (inertia) cancelAnimationFrame(inertia)
  railInertiaFrames.delete(track)
  track.classList.remove('is-dragging', 'is-programmatic-scrolling')
}

function animateRailToIndex(track, index, duration = 900) {
  if (!track) return
  cancelRailMotion(track)
  const destinations = getRailSnapPositions(track)
  if (!destinations.length) return
  const destination = destinations[Math.max(0, Math.min(destinations.length - 1, index))]
  track.classList.add('is-programmatic-scrolling')
  animateRailTo(track, destination, duration, () => track.classList.remove('is-programmatic-scrolling'))
}

function animateRailBy(track, direction, duration = 900) {
  if (!track) return
  const destinations = getRailSnapPositions(track)
  if (!destinations.length) return
  const currentIndex = destinations.reduce(
    (closestIndex, current, index) => Math.abs(current - track.scrollLeft) < Math.abs(destinations[closestIndex] - track.scrollLeft) ? index : closestIndex,
    0,
  )
  animateRailToIndex(track, currentIndex + direction, duration)
}

function settleRail(track) {
  const destinations = getRailSnapPositions(track)
  if (!destinations.length) { track.classList.remove('is-dragging'); return }
  const destination = destinations.reduce((closest, current) =>
    Math.abs(current - track.scrollLeft) < Math.abs(closest - track.scrollLeft) ? current : closest
  )
  animateRailTo(track, destination, 900, () => track.classList.remove('is-dragging'))
}

function beginRailDrag(event, dragRef) {
  if (event.pointerType === 'touch' && window.matchMedia('(max-width: 767px)').matches) {
    cancelRailMotion(event.currentTarget)
    return
  }
  if (event.pointerType !== 'mouse' && event.pointerType !== 'pen' && event.pointerType !== 'touch') return
  if (event.pointerType === 'mouse' && event.button !== 0) return
  if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, [data-no-rail-drag]')) return
  const track = event.currentTarget
  cancelRailMotion(track)
  // Stop any in-flight smooth arrow scroll before taking direct control.
  track.scrollLeft = track.scrollLeft
  const now = performance.now()
  dragRef.current = { x: event.clientX, left: track.scrollLeft, lastX: event.clientX, lastTime: now, velocity: 0, moved: false, pointerId: event.pointerId }
  track.setPointerCapture?.(event.pointerId)
}
function moveRailDrag(event, dragRef) {
  const drag = dragRef.current
  if (!drag || drag.pointerId !== event.pointerId) return
  const track = event.currentTarget
  const now = performance.now()
  const dx = event.clientX - drag.x
  if (Math.abs(dx) > 4 && !drag.moved) {
    drag.moved = true
    track.classList.add('is-dragging')
  }
  if (!drag.moved) return
  event.preventDefault()
  const dt = Math.max(1, now - drag.lastTime)
  drag.velocity = (event.clientX - drag.lastX) / dt
  drag.lastX = event.clientX
  drag.lastTime = now
  track.scrollLeft = drag.left - dx
}
function finishRailDrag(event, dragRef) {
  const drag = dragRef.current
  if (!drag || drag.pointerId !== event.pointerId) return
  const track = event.currentTarget
  if (drag.moved) {
    let velocity = -drag.velocity
    let previous = performance.now()
    const coast = (now) => {
      const dt = Math.min(32, now - previous)
      previous = now
      velocity *= Math.pow(.94, dt / 16.67)
      const before = track.scrollLeft
      track.scrollLeft += velocity * dt
      const max = Math.max(0, track.scrollWidth - track.clientWidth)
      if (Math.abs(velocity) < .015 || track.scrollLeft === before || track.scrollLeft <= 0 || track.scrollLeft >= max) {
        railInertiaFrames.delete(track)
        settleRail(track)
        return
      }
      railInertiaFrames.set(track, requestAnimationFrame(coast))
    }
    railInertiaFrames.set(track, requestAnimationFrame(coast))
  } else {
    track.classList.remove('is-dragging')
  }
  const completedDrag = drag
  window.setTimeout(() => { if (dragRef.current === completedDrag) dragRef.current = null }, 120)
}
function cancelRailDrag(event, dragRef) {
  const track = event.currentTarget
  const animation = railFrames.get(track)
  if (animation) cancelAnimationFrame(animation)
  railFrames.delete(track)
  const inertia = railInertiaFrames.get(track)
  if (inertia) cancelAnimationFrame(inertia)
  railInertiaFrames.delete(track)
  track.classList.remove('is-dragging')
  dragRef.current = null
}

const email = 'mailto:jcdcocampo@gmail.com'
const mobileSwipePages = ['home', 'experience', 'projects', 'licenses']
const projectPathAliases = { bushop: 'busboy', 'banana-shelflife': 'feedforward' }
function portfolioPathForPage(page) {
  if (page === 'home') return '/'
  if (page.startsWith('project:')) {
    const slug = page.slice('project:'.length)
    return `/projects/${projectPathAliases[slug] || slug}`
  }
  return ({
    experience: '/experience',
    projects: '/projects',
    licenses: '/licenses-and-certifications',
    mian: '/projects/mian',
    privacy: '/privacy-policy',
    terms: '/terms-and-conditions',
  })[page] || '/404.html'
}
function portfolioPageFromLocation() {
  const params = new URLSearchParams(window.location.search)
  const legacyPage = params.get('page')
  if (legacyPage === 'project') {
    const slug = params.get('project') || ''
    return institutionalProjectArticles[slug] ? `project:${slug}` : 'not-found'
  }
  const legacyRoutes = {
    'licenses-certifications': 'licenses', projects: 'projects', mian: 'mian',
    experience: 'experience', privacy: 'privacy', terms: 'terms',
  }
  if (legacyPage) return legacyRoutes[legacyPage] || 'not-found'

  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return 'home'
  const staticRoutes = {
    '/experience': 'experience',
    '/projects': 'projects',
    '/licenses-and-certifications': 'licenses',
    '/privacy-policy': 'privacy',
    '/terms-and-conditions': 'terms',
  }
  if (staticRoutes[path]) return staticRoutes[path]
  const projectPath = path.match(/^\/projects\/([^/]+)$/)
  if (projectPath) {
    if (projectPath[1] === 'mian') return 'mian'
    const projectAliases = { busboy: 'bushop', bushop: 'bushop', feedforward: 'banana-shelflife', 'banana-shelflife': 'banana-shelflife' }
    const slug = projectAliases[projectPath[1]] || projectPath[1]
    return institutionalProjectArticles[slug] ? `project:${slug}` : 'not-found'
  }
  return 'not-found'
}
const pageSwipeInteractiveSelector = '#navc, input, textarea, select, option, [contenteditable="true"], [data-page-swipe-ignore]'
const pageSwipeCarouselSelector = '.certification-track, .licenses-row-track, [data-carousel-track], [data-no-page-swipe]'
function isPageSwipeExcluded(target, boundary) {
  if (!(target instanceof Element)) return false
  if (target.closest(pageSwipeInteractiveSelector)) return true
  if (target.closest(pageSwipeCarouselSelector)) return true
  for (let element = target; element && element !== boundary; element = element.parentElement) {
    if (element.matches('[data-no-page-swipe], [data-page-swipe-ignore]')) return true
    const { overflowX } = getComputedStyle(element)
    if ((overflowX === 'auto' || overflowX === 'scroll') && element.scrollWidth > element.clientWidth + 2) return true
  }
  return false
}
const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jcdcocampo', src: '/images/social/linkedin-logo.png', hoverSrc: '/images/social/linkedin-logo-full.png' },
  { label: 'GitHub', href: 'https://github.com/jcdcocampo', src: '/images/social/github-logo.png', hoverSrc: '/images/social/github-logo-full.png' },
]

function SectionTitle({ children }) { return <div className="section-title"><h2>{children}</h2></div> }
function Photo({ src, alt, className = '' }) { return <div className={`photo ${className}`}><img src={src} alt={alt} loading="lazy" decoding="async" /></div> }
function Logo({ src, label, className = '' }) { return <span className={`logo-frame ${className}`}><img src={src} alt={`${label} logo`} loading="lazy" /></span> }
function ViewAll({ href, onClick }) { return href ? <a className="view-all" href={href} onClick={onClick}>View All</a> : <button className="view-all" type="button" aria-label="View All (coming later)">View All</button> }

function Hero() {
  const faceClickCount = useRef(0)
  const countFaceClick = () => {
    faceClickCount.current += 1
    if (faceClickCount.current >= 7) window.location.assign('/404.html')
  }
  const formatPhtTime = () => new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
  }).format(new Date())
  const [phtTime, setPhtTime] = useState(formatPhtTime)
  useEffect(() => {
    const timer = window.setInterval(() => setPhtTime(formatPhtTime()), 1_000)
    return () => window.clearInterval(timer)
  }, [])
  return <section className="hero" id="home" data-command-section="Introduction">
    <div className="hero-backdrop" aria-hidden="true" />
    <div className="hero-inner">
      <img className="hero-portrait" src="/images/optimized/hero.jpg" alt="Jose Carlo David Ocampo" role="button" tabIndex={0} aria-label="Portrait of Jose Carlo David Ocampo" fetchPriority="high" decoding="async" onClick={countFaceClick} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); countFaceClick() } }} onLoad={(event) => event.currentTarget.classList.add('is-loaded')} />
      <div className="hero-content">
        <h1>Engr. Jose Carlo<br />David Ocampo</h1>
        <p className="hero-role"><span className="role-primary">Application &amp; Cloud Support Associate</span><span className="role-divider" aria-hidden="true"> | </span><span className="role-secondary">Electronics Engineer</span></p>
        <p className="hero-location"><span className="hero-location-place"><MapPin size={16} aria-hidden="true" /> <span>Metro Manila</span><span className="hero-location-country">, Philippines</span></span><span className="hero-location-separator" aria-hidden="true">|</span><span className="hero-location-time"><time>{phtTime}</time> PHT</span></p>
        <div className="hero-actions" id="section-social" data-command-section="Contact and Social Links">
          <a className="email-button" href={email}>Send Email</a>
          {socials.map(({ label, href, src, hoverSrc }) => <a className="social-button" key={label} href={href} target="_blank" rel="noreferrer" aria-label={`${label} profile`}><img className="social-logo-default" src={src} alt="" /><img className="social-logo-hover" src={hoverSrc} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /></a>)}
        </div>
      </div>
    </div>
  </section>
}

function Experience() {
  const experienceTrackRef = useRef(null)
  const experienceDragRef = useRef(null)
  const [activeExperience, setActiveExperience] = useState(0)
  const scrollExperience = (direction) => {
    animateRailBy(experienceTrackRef.current, direction, 1000)
  }
  return <section className="section experience-section" id="experience" data-command-section="Experience"><div className="container">
    <div className="experience-heading"><SectionTitle>Experience</SectionTitle><div className="experience-heading-row"><div className="carousel-controls" aria-label="Experience navigation"><button className="carousel-arrow" type="button" onClick={() => scrollExperience(-1)} aria-label="Previous experience"><ChevronLeft size={18}/></button><button className="carousel-arrow" type="button" onClick={() => scrollExperience(1)} aria-label="Next experience"><ChevronRight size={18}/></button></div></div></div>
    <div className="experience-list" ref={experienceTrackRef}
      onPointerDown={(event) => beginRailDrag(event, experienceDragRef)}
      onPointerMove={(event) => moveRailDrag(event, experienceDragRef)}
      onPointerUp={(event) => finishRailDrag(event, experienceDragRef)}
      onPointerCancel={(event) => cancelRailDrag(event, experienceDragRef)}
      onDragStart={(event) => event.preventDefault()}
      onClickCapture={(event) => { if (experienceDragRef.current?.moved) event.preventDefault(); experienceDragRef.current = null }}
      onScroll={(event) => { const track = event.currentTarget; const card = track.querySelector('.experience-card'); const step = (card?.getBoundingClientRect().width || 1) + (Number.parseFloat(getComputedStyle(track).gap) || 0); setActiveExperience(Math.max(0, Math.min(1, Math.round(track.scrollLeft / step)))) }}>
      <article className="experience-card feature-card squircle-card" data-command-section="Application & Cloud Support Associate"><Photo src="/images/optimized/accenture.jpg" alt="At Accenture office" className="experience-photo" /><div className="experience-shade" /><div className="experience-copy"><Logo src="/images/experience/accenture-logo.png" label="Accenture" className="experience-logo" /><span className="eyebrow accenture">Accenture, Inc.</span><h3>Application &amp; Cloud Support Associate</h3><p>2026 – Present</p></div></article>
      <article className="experience-card feature-card squircle-card" data-command-section="Information Technology Helpdesk Intern"><Photo src="/images/optimized/converge.jpg" alt="Converge ICT Solutions internship" className="experience-photo" /><div className="experience-shade" /><div className="experience-copy"><Logo src="/images/experience/converge-logo.png" label="Converge" className="experience-logo" /><span className="eyebrow cyan">Converge ICT Solutions, Inc.</span><h3>Information Technology Helpdesk Intern</h3><p>2025</p></div></article>
    </div>
    <div className="experience-pagination" aria-label={`Experience ${activeExperience + 1} of 2`}>{[0,1].map(index => <span key={index} className={index === activeExperience ? 'is-active' : ''} />)}</div>
  </div></section>
}

const groups = [
  { name: 'Mapúa Cardinal One', role: 'Electronics Engineer, Media Manager', image: '/images/optimized/cardinal-one.jpg', href: 'https://www.facebook.com/mucardinalone/', tone: 'red', commandSection: 'Electronics Engineer & Media Manager' },
  { name: 'IECEP-MUSC', role: 'Board Auditor, Treasurer', image: '/images/optimized/iecep-musc.jpg', href: 'https://www.facebook.com/iecep.musc/', tone: 'light-blue', commandSection: 'Board Auditor, Treasurer' },
  { name: 'IEEE-MUSB', role: 'Finance Committee Head', image: '/images/optimized/ieee-musb.jpg', href: 'https://www.facebook.com/ieeemapuasb/', tone: 'dark-blue', commandSection: 'Finance Committee Head' },
]
function Education() {
  return <section className="section education-section" id="education" data-command-section="Education"><div className="container">
    <SectionTitle>Education</SectionTitle>
    <article className="education-feature feature-card squircle-card" data-command-section="BS Electronics Engineering"><a className="education-photo-link" href="https://www.mapua.edu.ph/" target="_blank" rel="noreferrer" aria-label="Visit Mapúa University"><Photo src="/images/optimized/education.jpg" alt="Mapúa University graduation portrait" className="education-photo" /></a><div className="education-copy"><Logo src="/images/education/mapua-logo.png" label="Mapúa University" /><span className="eyebrow red">Mapúa University</span><h3>BS Electronics Engineering</h3><p>Advanced Internet Protocol Networking</p><time>2025</time></div></article>
    <div className="education-grid">{groups.map(g => <a className="education-card secondary-card squircle-card" data-command-section={g.commandSection} href={g.href} target="_blank" rel="noreferrer" key={g.name}><Photo src={g.image} alt={`${g.name} organization photo`} /><div className="education-card-copy"><span className={`eyebrow ${g.tone}`}>{g.name}</span><h3>{g.role}</h3></div></a>)}</div>
  </div></section>
}

const projects = [
  { slug: 'bushop', name: 'BusHop: Live Bus Tracking & Trip Planning', organization: 'Accenture Digital Core Elite Bootcamp', image: '/images/projects/bushop-hero.jpg', tag: 'Applied AI', kind: 'project-card' },
  { slug: 'banana-shelflife', name: 'FFNN for Prediction of Lakatan Banana Shelf Life', organization: 'Institute of Electrical and Electronics Engineers', image: '/images/projects/banana-shelflife-hero.jpg', tag: 'Published Research', tone: 'blue', kind: 'project-card' },
]
function Projects({ onViewAll, onMianClick, onProjectClick }) {
  return <section className="section projects-section" id="projects" data-command-section="Projects"><div className="container">
    <SectionTitle>Projects</SectionTitle>
    <a className="project-feature feature-card squircle-card" href={portfolioPathForPage('mian')} onClick={(event) => onMianClick(event)} aria-label="Mian: An Intelligent Portfolio Assistant"><Photo src="/images/projects/mian-hero.jpg" alt="Mian intelligent portfolio assistant" /><div className="project-feature-copy"><span className="eyebrow blue">Personal AI</span><h3>Mian: An Intelligent Portfolio Assistant</h3></div></a>
    <div className="projects-grid">{projects.map(p => <a className="project-card secondary-card squircle-card" href={portfolioPathForPage(`project:${p.slug}`)} onClick={(event) => onProjectClick(event, p.slug)} key={p.name}><Photo src={p.image} alt={p.name} /><div className="project-card-copy"><span className={`eyebrow ${p.tone || 'purple'}`}>{p.tag}</span><h3>{p.name}</h3><p>{p.organization}</p></div></a>)}</div>
    <ViewAll href={portfolioPathForPage('projects')} onClick={onViewAll} />
  </div></section>
}

const portfolioProjects = {
  personal: {
    title: 'Mian: An Intelligent Portfolio Assistant',
    image: '/images/projects/mian-hero.jpg',
    alt: 'Mian intelligent portfolio assistant project',
    tag: 'PERSONAL AI',
    tone: 'blue',
  },
  institutional: [
    {
      slug: 'bushop',
      title: 'BusHop: Live Bus Tracking and Trip Planning for Victory Liner Routes',
      image: '/images/projects/bushop-hero.jpg',
      alt: 'BusHop live bus tracking and trip planning application',
      organization: 'Accenture Digital Core Bootcamp',
      tag: 'APPLIED AI', tone: 'purple',
    },
    {
      slug: 'banana-shelflife',
      title: 'Feedforward Neural Network for Real-time Prediction of Lakatan Banana Shelf Life using Sensor Data from Transport Conditions',
      image: '/images/projects/banana-shelflife-hero.jpg',
      alt: 'Feedforward neural network for Lakatan banana shelf-life prediction',
      organization: 'Institute of Electrical and Electronics Engineers',
      tag: 'PUBLISHED RESEARCH', tone: 'blue',
    },
    {
      slug: 'aguila',
      title: 'Aguila: Design and Development of an Energy-Efficient Vehicle for Shell Eco-marathon',
      image: '/images/projects/aguila-hero.jpg',
      alt: 'Aguila energy-efficient vehicle for Shell Eco-marathon',
      organization: 'Mapúa University Cardinal One',
      tag: 'ENGINEERING', tone: 'red',
    },
    {
      slug: 'eeg-exoskeleton',
      title: 'Electroencephalogram (EEG) Headset-controlled Lower Body Adjustable Cybernetic Exoskeleton Through a Brain-computer Interface',
      image: '/images/projects/eeg-exoskeleton-hero.jpg',
      alt: 'EEG headset-controlled lower body cybernetic exoskeleton',
      organization: 'Marcelo H. del Pilar National High School — Junior High School, Science, Technology, and Engineering (STE) Program',
      tag: 'BRAIN-COMPUTER INTERFACE', tone: 'green',
    },
  ],
}

const institutionalProjectArticles = {
  bushop: {
    eyebrow: 'APPLIED AI', pillTone: 'purple', title: 'BusHop: Live Bus Tracking and Trip Planning for Victory Liner Routes',
    subtitle: "Our capstone project at Accenture's Digital Core Elite Bootcamp, a proposal for a web application that would tell a commuter where the bus is, when it arrives, what the fare costs, and exactly where they are allowed to board. The buses in the prototype are simulated, not live.",
    image: '/images/projects/bushop-hero.jpg', alt: 'BusHop live bus tracking application', action: { label: 'Visit BusHop', href: 'https://jcdcocampo.github.io/bushop/' },
    lead: 'BusHop is a proposal, not a service that is running today. It is a working prototype built to show what live bus information could look like for provincial commuters, and the buses moving on its map are simulated rather than reported by real vehicles. Everything around them, the routes, the terminals, the boarding rules and the fares, is drawn from published Victory Liner information, government road data and fares confirmed by riders.',
    paragraphs: ['Anyone who has waited for a provincial bus knows the same three questions: is one actually coming, how long until it gets here, and how much will it cost. Printed schedules answer none of these, and none of them can be answered from the side of the road.', 'BusHop is our proposed answer to those questions. It runs in any browser, with no installation and no account, and it covers Victory Liner services across Central and Northern Luzon: the Zambales, Pangasinan, Baguio and Cagayan Valley lines, in both their Express and Inner Cities forms.'],
    sections: [
      { title: 'What It Does', paragraphs: ['Open the prototype and the map shows buses moving along the real road network, colour-coded by line. Set your location and you immediately see the nearest bus, its plate number, how many minutes away it is, and when it will reach you. Add a destination and the app plans the whole trip, including the fare, the arrival time, and whether the journey needs one bus or two.'], bullets: ['Live tracking of around 900 buses across four lines, simulated in this prototype', 'Fare estimates calibrated against real Victory Liner fares', 'Boarding points with walking, motorcycle or car travel times', 'Automatic transfers at real terminals such as Dau, San Fernando and Urdaneta', 'BusBoy, a conversational assistant that answers in English, Filipino or a mix of both'] },
      { title: 'How It Is Built', paragraphs: ['The entire application is a single HTML file served as a static page, with one small Cloudflare Worker behind the assistant so that no API key is ever exposed to the browser. The map is rendered with MapLibre GL JS over open map tiles, and the road shapes are traced against a public routing service, so the lines on screen follow the actual highways rather than straight approximations.', 'The buses themselves are simulated rather than fed by live GPS, which is the main thing that separates the proposal from a deployable service. In practice the positions would come from the operator’s own GPS units. For now, each bus is generated from a seeded model, so every device shows the same fleet without any server, and their speeds respond to rush hour, night-time, weather and terrain. Fares come from a model calibrated against fares confirmed by riders, which is why BusBoy cannot invent a number: the assistant chooses which calculation to run, but the figures come from the fare matrix and the live simulation.'] },
      { title: 'The Team', paragraphs: ["BusHop was built as our capstone project at Accenture's Digital Core Elite Bootcamp, a programme focused on applying cloud, data and AI to real problems. It was a genuinely collaborative build, and the routing, the fare model and the assistant each came out of long discussions about how commuters actually travel."] },
    ],
    meta: [['Team', 'Jose Carlo David Ocampo, Micheal Radislao, Jayrene Culasing, Nestor Morales III, Prince Mangahas'], ['Programme', 'Digital Core Elite Bootcamp, Accenture Philippines']],
  },
  'banana-shelflife': {
    eyebrow: 'PUBLISHED RESEARCH', title: 'Feedforward Neural Network for Real-time Prediction of Lakatan Banana Shelf Life using Sensor Data from Transport Conditions',
    subtitle: 'An IoT and machine learning system that monitors transport conditions in real time to predict how much shelf life a batch of Lakatan bananas has left, while they are still on the way.',
    image: '/images/projects/banana-shelflife-hero.jpg', alt: 'Lakatan banana shelf life prediction project', action: { label: 'View Full Article', href: 'https://ieeexplore.ieee.org/document/11140885' },
    lead: "The Philippines is one of the world's largest banana producers, and Lakatan is one of the most beloved varieties in the country. Yet a significant amount of it spoils before it ever reaches the table, not because of bad farming, but because of what happens in between.",
    paragraphs: ['Temperature, humidity, and the physical stress of being moved around quietly shorten a banana’s remaining life while it sits in a truck or a storage facility. By the time anyone notices, the damage is already done.', 'That was the problem we wanted to solve. My co-researcher and I built a system that monitors those transport conditions in real time using sensors, and feeds that data into a neural network, a program trained to recognize patterns and make predictions the way a human brain learns from experience. The system figures out how those conditions interact and uses that to estimate how much shelf life a batch of bananas has left, while they are still on the way.', 'The goal was not simply to detect that something was going wrong. It was to give enough warning that someone could actually do something about it.', 'I was responsible for both the software and hardware side of the project, from wiring up the sensors to writing the code and gathering the data that made everything run. It was some of the most demanding work I have done, and also some of the most rewarding.'],
    sections: [{ title: 'Awards and Recognition', bullets: ['Best Presenter — 57th EECE Thesis Colloquium', 'Presented at the 2025 8th International Conference on Computing Methodologies and Communication (ICCMC)'] }],
    meta: [['Proponents', 'Jose Carlo David C. Ocampo, Marianne Karylle C. Felix'], ['Research Adviser', 'Dr. Jennifer C. Dela Cruz'], ['Institution', 'Mapua University — School of Electrical, Electronics, and Computer Engineering']],
  },
  aguila: {
    eyebrow: 'ENGINEERING', pillTone: 'red', title: 'Aguila: Design and Development of an Energy-Efficient Vehicle for Shell Eco-marathon',
    subtitle: "Mapua University Cardinal One, competing for maximum efficiency at Shell Eco-marathon Asia Pacific and the Middle East, from internal combustion to the Philippines' first battery electric prototype.",
    image: '/images/projects/aguila-hero.jpg', alt: 'Aguila energy-efficient vehicle by Mapua University Cardinal One',
    lead: 'Before I even set foot inside Mapua University, joining Cardinal One was already the plan. I had always loved cars, taking apart RC cars as a kid, customizing them, figuring out how they worked. The team was the reason I chose Mapua in the first place.',
    paragraphs: ['Cardinal One competes in the Shell Eco-marathon Asia Pacific and the Middle East, a global engineering competition where teams build prototype vehicles and push them to travel as far as possible on the least amount of energy. It is not about speed. It is about efficiency, and every gram, every circuit, every design decision is measured against fuel consumption or electrical draw.', 'In 2022, during my second year at Mapua, the team opened applications for apprentices. I applied. In Season 2024, I joined as an Electronics Engineer, the role I had always been working toward.'],
    sections: [
      { title: 'Season 2024: Back on the Track', paragraphs: ['Season 2024 marked the team’s return after years of hiatus, and Aguila ran on an internal combustion engine. My primary contribution was to the vehicle’s electronics, a role that came with little room for error, since failure during a run was not an option.', 'We passed the technical inspection, which in itself was a milestone for the returning team. From there, Aguila performed.'], bullets: ['7th place in the Prototype ICE division', '1st among all Philippine teams', 'Technical Innovation Award, for the Atkinson cycle thesis authored by Engr. Jose Luis Villalon', 'Mileage: 274 km/L'] },
      { title: 'Season 2025: Development Continues', paragraphs: ['We were unable to compete in 2025 due to time constraints and the vehicle not being ready. But the work did not stop. The team continued developing and improving Aguila, laying the groundwork for what was coming next.'] },
      { title: 'Season 2026: A New Frontier', paragraphs: ['Season 2026 was different in every way. The team made the shift from internal combustion to battery electric, a transition that put Mapua Cardinal One among the first Philippine teams to compete with a fully electric prototype at Shell Eco-marathon Asia Pacific and the Middle East. It was uncharted territory, and I was still part of it, continuing my role in vehicle electronics development while also serving as Media Manager, handling the team’s branding and public presence.', 'I concluded my participation during the preparation phase for 2026. Graduation and board exam preparations meant stepping away, but stepping away was not the same as leaving. The team had become my second home at Mapua, and from a distance, I still followed every update, every run, every milestone.', 'Aguila passed technical inspection again. The team posted 91 km/kWh, modest by the competition’s standards, but a genuine first for the Philippines in battery electric. Every first has to start somewhere.'] },
    ],
    meta: [['Team', 'Mapua University Cardinal One'], ['Competition', 'Shell Eco-marathon Asia Pacific and the Middle East'], ['Role', 'Electronics Engineer, Media Manager'], ['Seasons', '2024, 2026 (active participation 2022 to 2025)'], ['Institution', 'Mapua University']],
  },
  'eeg-exoskeleton': {
    eyebrow: 'BRAIN-COMPUTER INTERFACE', pillTone: 'green', title: 'Electroencephalogram (EEG) Headset-controlled Lower Body Adjustable Cybernetic Exoskeleton Through a Brain-computer Interface',
    subtitle: 'A potential rehabilitation device for physical therapy — built by junior high school students in an open garage, powered by thought, and designed to make robotic recovery accessible to those who need it most.',
    image: '/images/projects/eeg-exoskeleton-hero.jpg', alt: 'EEG headset-controlled lower body exoskeleton', action: { label: 'View Full Article', href: 'https://ojs.aaresearchindex.com/index.php/AAJMRA/article/view/4509' },
    lead: 'In 2018, our team of five junior high school students set out to answer a question that felt bigger than us: could someone who struggles to walk control a robotic suit using only their mind?',
    paragraphs: ['The answer, after months of work in an open garage with PVC pipes, servo motors, and a whole lot of debugging, was yes.', 'We built a lower body exoskeleton, a wearable robotic frame that straps onto your legs and moves them for you, controlled entirely through an Emotiv Insight EEG headset that reads brain signals. Think of it as a direct line between thought and movement. The user concentrates on a mental command, the headset picks it up wirelessly, and the exoskeleton walks.', 'What made ours different from the expensive commercial versions out there was accessibility. We built it from affordable, locally available materials to make robotic rehabilitation less out of reach, because the people who need it most are often the ones who cannot afford what already exists.'],
    sections: [{ title: 'Awards and Recognition', bullets: ['Best Presenter, Robotics and Intelligent Machines Category — Annual Research Conference, Marcelo H. del Pilar National High School', 'Official Entry, 2018 Regional Science and Technology Fair by DepED', 'Top 12 out of 2,000+ research entries nationwide — Research Advocacy for Community Empowerment (RACE) by Ascendens Asia Singapore'] }],
    meta: [['Proponents', 'Ayumi Bolo, Fermina Kassandra D. Dela Cruz, Crincess Jestine N. Maglanque, Jose Carlo David C. Ocampo, Haniel Nikolai J. Rodriguez'], ['Research Adviser', 'Risalita C. Nalla, EdD'], ['Institution', 'Marcelo H. del Pilar National High School — Junior High School, Science, Technology, and Engineering (STE) Program']],
  },
}

function useCompactHeader(isActive = true) {
  const [compactHeader, setCompactHeader] = useState(false)
  const compactState = useRef(false)
  useEffect(() => {
    if (!isActive) return
    const updateHeader = () => {
      const y = window.scrollY
      const next = compactState.current ? y > 24 : y > 64
      if (next === compactState.current) return
      compactState.current = next
      setCompactHeader(next)
    }
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [isActive])
  return compactHeader
}

function ProjectArticlePage({ slug, onBack }) {
  const compactHeader = useCompactHeader()
  const article = institutionalProjectArticles[slug]
  if (!article) return null
  return <div className="projects-page project-article-page">
    <header className={`licenses-nav projects-nav ${compactHeader ? 'is-compact' : ''}`}>
      <div className="licenses-nav-inner"><a className="licenses-back-button" href={portfolioPathForPage('projects')} onClick={onBack} aria-label="Back to Projects"><ChevronLeft size={18} aria-hidden="true" /></a><h1>Projects</h1></div>
    </header>
    <main className="mian-article project-page-reveal" data-command-section="Overview">
      <span className={`eyebrow ${article.pillTone || 'blue'} mian-article-eyebrow`}>{article.eyebrow}</span>
      <h2>{article.title}</h2>
      <p className="mian-article-subtitle">{article.subtitle}</p>
      <figure className="mian-article-hero squircle-card"><Photo src={article.image} alt={article.alt} /></figure>
      {article.action && <div className="mian-project-action-wrap"><a className="mian-project-action squircle-card" href={article.action.href} target="_blank" rel="noreferrer">{article.action.label}</a></div>}
      <div className="mian-article-body">
        <p className="mian-article-lead">{article.lead}</p>
        {article.paragraphs.map((paragraph, index) => <p key={`p-${index}`}>{paragraph}</p>)}
        {article.sections.map((section) => <section className="project-article-section" data-command-section={section.title} key={section.title}><h3>{section.title}</h3>{section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}</section>)}
        {article.meta && <div className="mian-article-meta">{article.meta.map(([label, value]) => <p key={label}><strong>{label}:</strong> {value}</p>)}</div>}
      </div>
    </main>
  </div>
}

const legalContent = {
  privacy: {
    title: 'Privacy Policy', updated: 'Last updated: November 2026',
    sections: [
      { title: 'Overview', paragraphs: ['This is the personal website of Engr. Jose Carlo David Ocampo (referred to below as “JC” or “the site owner”). This Privacy Policy explains what happens—and what does not happen—to information when you visit this site or interact with the AI assistant (“Mian”) embedded on it.'] },
      { title: 'Data Collection by the Site Owner', paragraphs: ['The site owner does not run analytics trackers, advertising cookies, email sign-up lists, or user accounts. When you use Mian, the chatbot service temporarily processes your IP address for abuse prevention and sends your message and recent chat context to the third-party AI provider to generate a response. The Worker does not intentionally save chat content or write it to logs. Cloudflare and the AI provider may process service and request data under their own policies.', 'The site does not save chat history or visitor preferences in your browser after the active page session.'] },
      { title: 'The AI Chatbot (“Mian”)', paragraphs: ['Mian is an AI assistant whose responses are generated by a third-party large language model accessed through an external API. The site owner did not build, train, or develop the underlying AI model—it is a borrowed service.'], callout: 'Because Mian’s replies come from a third-party AI service, the site owner has no control over the model’s output. Anything Mian says should be independently verified before you act on it. Mian can make mistakes, misremember details, or generate inaccurate information, even when she sounds confident.' },
      { title: 'What Happens to Your Chat Messages', paragraphs: ['When you send a message to Mian, the message is forwarded through a secure proxy to the third-party AI service so that a reply can be generated. By using the chatbot, you understand and agree that:'], bullets: ['Your messages are transmitted to a third-party AI provider in order to generate a response.', 'The third-party provider may process, log, or use your messages according to their own privacy and data-usage policies, which are outside the site owner’s control.', 'The site owner does not personally save, read, or store your conversations on this website.', 'You should treat anything you type into Mian the same way you would treat a public message: assume it could be processed or retained by the AI provider.'] },
      { title: 'Please Do Not Share Sensitive Information', paragraphs: ['Do not enter sensitive personal information into the chatbot. This includes, but is not limited to: passwords, government identification numbers, financial account details, medical records, private contact information of other people, or any confidential business information.', 'If you have a private matter to discuss with JC directly, please email him at jcdcocampo@gmail.com instead of sending it through the chatbot.'] },
      { title: 'External Links', paragraphs: ['This site contains links to third-party websites such as LinkedIn, GitHub, Coursera, IEEE Xplore, and others. The site owner is not responsible for the privacy practices or content of those external sites. Please review their privacy policies before sharing any information with them.'] },
      { title: 'Changes to This Policy', paragraphs: ['This Privacy Policy may be updated from time to time. The “Last updated” date at the top of this page reflects the most recent revision.'] },
      { title: 'Contact', paragraphs: ['For any questions about this Privacy Policy, please email jcdcocampo@gmail.com.'] },
    ],
  },
  terms: {
    title: 'Terms and Conditions', updated: 'Last updated: April 2026',
    sections: [
      { title: 'Acceptance of Terms', paragraphs: ['By accessing this website or interacting with the AI assistant (“Mian”), you agree to these Terms and Conditions. If you do not agree, please do not use the site or the chatbot.'] },
      { title: 'Purpose of the Site', paragraphs: ['This is the personal website of Engr. Jose Carlo David Ocampo (“JC”). It exists to share information about JC’s professional background, education, certifications, projects, and experience so that visitors can learn about him and consider connecting for opportunities.'] },
      { title: 'About the AI Assistant', paragraphs: ['Mian is an AI assistant powered by a third-party large language model accessed via an external API. JC did not build, train, or develop the underlying model—it is a borrowed AI service. Mian’s role is limited to helping visitors learn about JC.'], callout: 'AI responses can be inaccurate. Mian may misremember, generalize, or make mistakes—even when she sounds confident. Always independently verify factual claims about JC’s credentials, dates, employers, or projects against the documented sources linked elsewhere on this site, or by emailing JC directly.' },
      { title: 'No Professional Advice', paragraphs: ['Nothing said by Mian, or written elsewhere on this site, constitutes professional engineering advice, legal advice, financial advice, or any other form of professional consultation. Information is provided for general informational purposes only.'] },
      { title: 'Use of the Chatbot', paragraphs: ['By using Mian, you acknowledge and agree to the following:'], bullets: ['Anything you type into the chatbot is transmitted to a third-party AI provider in order to generate a response.', 'The third-party AI provider may process, log, or use your messages according to its own policies, which are outside JC’s control.', 'You will not enter sensitive personal information (passwords, government IDs, financial details, medical records, confidential business information, or private information about other people) into the chatbot.', 'You will not use the chatbot to attempt to harm, harass, deceive, or impersonate anyone, or to extract information for malicious purposes.', 'You will not attempt to abuse, overload, or otherwise interfere with the chatbot or the proxy service that supports it.'] },
      { title: 'Intellectual Property', paragraphs: ['All original text, images, code, and design on this website—including the structure of the AI assistant—are the personal work of JC unless otherwise credited. Logos and trademarks of third parties (such as schools, certification bodies, and platforms) belong to their respective owners and are used here only for identification purposes.', 'You may not republish, redistribute, or commercially reuse the content of this site without written permission from JC.'] },
      { title: 'Disclaimer and Limitation of Liability', paragraphs: ['This site and the chatbot are provided “as is” and “as available,” without warranties of any kind, either express or implied. JC does not guarantee that the site or the chatbot will always be available, error-free, secure, or accurate.', 'To the fullest extent permitted by law, JC will not be liable for any direct, indirect, incidental, consequential, or other damages arising from your use of this site or the chatbot, including reliance on any information generated by Mian.'] },
      { title: 'External Links', paragraphs: ['This site links to third-party websites for verification and reference. JC has no control over, and assumes no responsibility for, the content, policies, or practices of any third-party sites.'] },
      { title: 'Changes to These Terms', paragraphs: ['These Terms and Conditions may be updated at any time. The “Last updated” date at the top reflects the most recent revision. Continued use of the site after changes are posted means you accept the updated terms.'] },
      { title: 'Contact', paragraphs: ['For any questions about these Terms, please email jcdcocampo@gmail.com.'] },
    ],
  },
}

function LegalPage({ type, onBack }) {
  const compactHeader = useCompactHeader()
  const content = legalContent[type]
  return <div className="projects-page legal-page">
    <header className={`licenses-nav projects-nav ${compactHeader ? 'is-compact' : ''}`}>
      <div className="licenses-nav-inner"><a className="licenses-back-button" href="/" onClick={onBack} aria-label="Back to Home"><ChevronLeft size={18} aria-hidden="true" /></a><h1>{content.title}</h1></div>
    </header>
    <main className="legal-content">
      <p className="legal-updated">{content.updated}</p>
      <article className="legal-card squircle-card project-page-reveal">
        {content.sections.map((section) => <section className="legal-section" data-command-section={section.title} key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph.includes('jcdcocampo@gmail.com') ? <>{paragraph.split('jcdcocampo@gmail.com')[0]}<a href="mailto:jcdcocampo@gmail.com">jcdcocampo@gmail.com</a>{paragraph.split('jcdcocampo@gmail.com')[1]}</> : paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}{section.callout && <aside className="legal-callout squircle-card">{section.callout}</aside>}</section>)}
      </article>
    </main>
  </div>
}

function NotFoundPage({ onBack }) {
  const compactHeader = useCompactHeader()
  return <div className="projects-page not-found-page">
    <header className={`licenses-nav projects-nav ${compactHeader ? 'is-compact' : ''}`}><div className="licenses-nav-inner"><a className="licenses-back-button" href="/" onClick={onBack} aria-label="Back to Home"><ChevronLeft size={18} aria-hidden="true" /></a><h1>Page Not Found</h1></div></header>
    <main className="not-found-content" data-command-section="Page Not Found"><article className="not-found-card squircle-card"><span className="eyebrow blue">Error</span><h2>404</h2><p>This page doesn’t exist. Let’s get you back to the portfolio.</p><a className="mian-project-action squircle-card" href="/" onClick={onBack}>Back to Home</a></article></main>
  </div>
}

function ProjectsPage({ onBack, onMianClick, onProjectClick, isActive = true }) {
  const compactHeader = useCompactHeader(isActive)
  return <div className="projects-page">
    <header className={`licenses-nav projects-nav ${compactHeader ? 'is-compact' : ''}`}>
      <div className="licenses-nav-inner">
        <a className="licenses-back-button" href="/" onClick={onBack} aria-label="Back to portfolio"><ChevronLeft size={18} aria-hidden="true" /></a>
        <h1>Projects</h1>
      </div>
    </header>
    <main className="projects-library">
      <section className="projects-library-section project-page-reveal project-page-reveal-personal" data-command-section="Personal Project" aria-labelledby="personal-projects-title">
        <h2 className="projects-library-title" id="personal-projects-title">Personal Project</h2>
        <a className="projects-library-feature squircle-card" href={portfolioPathForPage('mian')} onClick={onMianClick} aria-label="Read about Mian: An Intelligent Portfolio Assistant">
          <Photo src={portfolioProjects.personal.image} alt={portfolioProjects.personal.alt} className="projects-library-art" />
          <div className="projects-library-shade" />
          <div className="projects-library-copy">
            <span className={`eyebrow ${portfolioProjects.personal.tone}`}>{portfolioProjects.personal.tag}</span>
            <h3>{portfolioProjects.personal.title}</h3>
          </div>
        </a>
      </section>
      <section className="projects-library-section projects-institutional project-page-reveal project-page-reveal-institutional" data-command-section="Institutional Research and Projects" aria-labelledby="institutional-projects-title">
        <h2 className="projects-library-title" id="institutional-projects-title">Institutional Research and Projects</h2>
        <div className="projects-library-grid">
          {portfolioProjects.institutional.map((project) => <a className="projects-library-card squircle-card" href={portfolioPathForPage(`project:${project.slug}`)} onClick={(event) => onProjectClick(event, project.slug)} key={project.title}>
            <Photo src={project.image} alt={project.alt} className="projects-library-card-art" />
            <div className="projects-library-shade" />
            <div className="projects-library-card-copy">
              <span className={`eyebrow ${project.tone}`}>{project.tag}</span>
              <h3>{project.title}</h3>
              <p>{project.organization}</p>
            </div>
          </a>)}
        </div>
      </section>
    </main>
  </div>
}

function MianProjectPage({ onBack }) {
  const compactHeader = useCompactHeader()
  return <div className="projects-page mian-project-page">
    <header className={`licenses-nav projects-nav ${compactHeader ? 'is-compact' : ''}`}>
      <div className="licenses-nav-inner">
        <a className="licenses-back-button" href={portfolioPathForPage('projects')} onClick={onBack} aria-label="Back to Projects"><ChevronLeft size={18} aria-hidden="true" /></a>
        <h1>Projects</h1>
      </div>
    </header>
    <main className="mian-article project-page-reveal" data-command-section="About Mian">
      <span className="eyebrow blue mian-article-eyebrow">PERSONAL AI</span>
      <h2>Mian: An Intelligent Portfolio Assistant</h2>
      <p className="mian-article-subtitle">An AI assistant built to greet visitors of this website, answer their questions about my background, and make a personal portfolio feel a little more like a conversation.</p>
      <figure className="mian-article-hero squircle-card"><Photo src="/images/projects/mian-hero.jpg" alt="Mian, an intelligent portfolio assistant" /></figure>
      <div className="mian-article-body">
        <p className="mian-article-lead">A resume tells you what someone has done. A conversation tells you who they are. I wanted my portfolio to do a little of both.</p>
        <p>Mian is the AI assistant you can find tucked into the corner of this website. She is there for anyone who would rather ask a question than scroll through a long page. Curious about my licenses? My thesis? Where I interned? You can simply ask her, and she will answer in plain conversation, the way a knowledgeable friend might.</p>
        <p>Behind the scenes, Mian is a custom chatbot interface that connects to a large language model through a secure proxy. I designed her personality, wrote her instructions, and gave her the context she needs to talk about my work accurately. This website does not store your messages, though they are sent to the third-party AI provider to generate a reply and may be processed under that provider’s policies. Mian does not pretend to be something she is not. If she does not know something, she says so and points you to my email instead.</p>
        <p>Building Mian was my way of stepping outside the boundaries of my electronics engineering background and into something a little more personal. It pulled together everything I have been quietly drawn to over the past few years, namely artificial intelligence, web development, user experience, and the small craft of making technology feel human. None of those were part of my degree, but all of them mattered to me.</p>
        <p>She is also a tribute. Mian was named, designed, and dedicated to the person I love the most. Her warmth, her patience, and the way she carries herself were all inspired by her. In a small way, every visitor who talks to Mian gets to meet a piece of someone very dear to me.</p>
        <section data-command-section="What Mian Does">
          <h3>What She Does</h3>
          <ul>
            <li>Answers questions about my education, licenses, certifications, projects, and experience</li>
            <li>Keeps every conversation focused, accurate, and grounded in real information</li>
            <li>Politely redirects when a question falls outside her scope, pointing visitors to my email</li>
          </ul>
        </section>
      </div>
    </main>
  </div>
}

function ExperiencePage({ onBack, isActive = true }) {
  const compactHeader = useCompactHeader(isActive)
  return <div className="projects-page experience-page">
    <header className={`licenses-nav projects-nav ${compactHeader ? 'is-compact' : ''}`}>
      <div className="licenses-nav-inner">
        <a className="licenses-back-button" href="/" onClick={onBack} aria-label="Back to portfolio"><ChevronLeft size={18} aria-hidden="true" /></a>
        <h1>Experience</h1>
      </div>
    </header>
    <main className="experience-library" aria-label="Experience">
      <Experience />
    </main>
  </div>
}

const navItems = [
  { id: 'home', label: 'Home', Icon: House },
  { id: 'experience', label: 'Experience', Icon: BriefcaseBusiness },
  { id: 'projects', label: 'Projects', Icon: LayoutGrid },
  { id: 'certs', label: 'Certs', Icon: Award },
]
function FloatingNavigation() {
  const syncNavOnLoad = useRef(null)
  useEffect(() => {
    const route = portfolioPageFromLocation()
    window.__navActive = route === 'licenses' ? 'certs' : route === 'mian' || route.startsWith('project:') ? 'projects' : route === 'privacy' || route === 'terms' || route === 'not-found' ? 'home' : route
    const setCurrentNav = () => window.__setPortfolioNavActive?.(window.__navActive)
    if (window.__portfolioNavReady) { setCurrentNav(); return }
    if (!window.__portfolioNavPromise) {
      window.__portfolioNavPromise = new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = '/nav.js?v=mian-precise-navigation-20261101-8'
        script.async = true
        script.onload = () => { window.__portfolioNavReady = true; resolve() }
        script.onerror = resolve
        document.body.appendChild(script)
      })
    }
    syncNavOnLoad.current = setCurrentNav
    window.__portfolioNavPromise.then(() => syncNavOnLoad.current?.())
  }, [])

  return createPortal(<>
    <div className="floating-controls-dock">
      <nav id="navc" className="portfolio-nav-container" aria-label="Portfolio pages">
        <div id="pill" className="portfolio-nav-pill">
          <div id="rpill" className="portfolio-nav-rest-pill" />
          <div id="ind" className="portfolio-nav-glass-indicator" />
          {navItems.map(({ id, label, Icon }) => <button className="nb" data-nav={id} type="button" key={id} aria-label={label} onClick={(event) => { if (event.detail === 0) window.__portfolioNavigate?.(id) }}>
            <Icon size={20} strokeWidth={2} aria-hidden="true" />
            <span>{label}</span>
          </button>)}
          <div id="wl" className="portfolio-nav-blue-layer" aria-hidden="true">
            {navItems.map(({ id, label, Icon }) => <div className="bw" key={id}><Icon size={20} strokeWidth={2} /><span>{label}</span></div>)}
          </div>
        </div>
      </nav>
      <div id="mian" className="mian-button" role="button" tabIndex={0} aria-label="Chat with Mian" onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        window.__isMianOpen?.() ? window.__closeMian?.() : window.__openMian?.()
      }}>
        <div id="mind" className="mian-glass-indicator" />
        <MessageCircle id="mico" size={24} strokeWidth={2} aria-hidden="true" />
      </div>
    </div>
  </>, document.body)
}

const certifications = [
  ['Electronics Engineering License','Philippine Professional Regulation Commission','/images/certifications/prc-logo.png','https://www.prcboard.com/eele-results-march-2026-electronics-engineering-licensure-exam-list-of-passers'],
  ['Electronics Technician License','Philippine Professional Regulation Commission','/images/certifications/prc-logo.png','https://www.prcboard.com/etle-results-march-2026-electronics-technician-licensure-exam-list-of-passers'],
  ['Network Fundamentals','Cisco Learning and Certifications','/images/certifications/cisco-logo.png','https://www.coursera.org/account/accomplishments/specialization/666CM1P8M9AJ'],
  ['CCNA: Enterprise Networking, Security, and Automation','Cisco Networking Academy','/images/certifications/cisco-logo.png','https://drive.google.com/file/d/1Rb07RrG52IYeNGnzPzjFkWZtVKmgKpCZ/view?usp=sharing'],
  ['CCNA: Switching, Routing, and Wireless Essentials','Cisco Networking Academy','/images/certifications/cisco-logo.png','https://drive.google.com/file/d/1HB3AstXyinvABZoDOFTtwENa4HQhVvTq/view?usp=sharing'],
  ['Google Cloud Fundamentals','Google Cloud Training Online','/images/certifications/google-cloud-logo.png','https://www.coursera.org/account/accomplishments/records/5MYY152OQTWD'],
  ['Foundations of Cybersecurity','Google','/images/certifications/google-logo.png','https://www.coursera.org/account/accomplishments/records/B8HXJVXNMB0A'],
]
const platforms = [
  ['Credly','https://credly.com/users/jcdcocampo','/images/platforms/credly.png'],
  ['Skillsoft','https://skillsoft.digitalbadges.skillsoft.com/profile/jcdcocampo/wallet','/images/platforms/skillsoft.png'],
  ['Google Skills','https://partner.skills.google/public_profiles/1231c0d6-211f-43d0-a4c6-0075b5e86a16','/images/platforms/google-skills.png'],
  ['Microsoft Learn','https://learn.microsoft.com/en-us/users/jcdcocampo/','/images/platforms/microsoft-learn.png'],
  ['AWS Skill Builder','https://skillbuilder.aws/','/images/platforms/aws-skill-builder.png'],
  ['Oracle University','https://education.oracle.com/','/images/platforms/oracle-university.png'],
]
function Certifications({ onViewAll }) {
  const trackRef = useRef(null)
  const [activeCertificate, setActiveCertificate] = useState(0)
  const dragRef = useRef(null)
  const scrollCertificates = (direction) => {
    animateRailBy(trackRef.current, direction, 1000)
  }
  return <section className="section certification-section" id="certifications" data-command-section="Licenses and Certifications"><div className="container">
    <div className="certification-heading"><SectionTitle>Licenses &amp; Certifications</SectionTitle><div className="carousel-controls" aria-label="Certificate navigation"><button className="carousel-arrow" type="button" onClick={() => scrollCertificates(-1)} aria-label="Previous certificates"><ChevronLeft size={18}/></button><button className="carousel-arrow" type="button" onClick={() => scrollCertificates(1)} aria-label="Next certificates"><ChevronRight size={18}/></button></div></div>
    <div className="certification-carousel">
    <div
      className="certification-track"
      data-no-page-swipe="true"
      ref={trackRef}
      aria-label="Licenses and certifications"
      onPointerDown={(event) => beginRailDrag(event, dragRef)}
      onPointerMove={(event) => moveRailDrag(event, dragRef)}
      onPointerUp={(event) => finishRailDrag(event, dragRef)}
      onPointerCancel={(event) => cancelRailDrag(event, dragRef)}
      onDragStart={(event) => event.preventDefault()}
      onClickCapture={(event) => { if (dragRef.current?.moved) event.preventDefault(); dragRef.current = null }}
      onScroll={(event) => {
        const track = event.currentTarget
        const card = track.querySelector('.certification-card')
        const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0
        const step = (card?.getBoundingClientRect().width || 1) + gap
        setActiveCertificate(Math.max(0, Math.min(certifications.length - 1, Math.round(track.scrollLeft / step))))
      }}
    >
      {certifications.map(([title,issuer,logo,href]) => <article className="certification-card squircle-card" data-command-section={title} key={title}>
        <div className="certificate-art"><img src={logo} alt={`${issuer} logo`} loading="lazy" /></div>
        <div className="certificate-copy"><h3>{title}</h3><p>{issuer}</p><a className="credential-button" href={href} target="_blank" rel="noreferrer">See Credential</a></div>
      </article>)}
    </div>
    <div className="certificate-pagination" aria-label={`Certificate ${activeCertificate + 1} of ${certifications.length}`}>{certifications.map((item, index) => <span key={item[0]} className={index === activeCertificate ? 'is-active' : ''} />)}</div>
    </div>
    <ViewAll href={portfolioPathForPage('licenses')} onClick={onViewAll} />
    <div className="platform-heading"><h3>Credential &amp; Learning Profiles</h3></div>
    <div className="platform-grid">{platforms.map(([name,href,logo]) => <a className="platform-card squircle-card" href={href} target="_blank" rel="noreferrer" key={name} aria-label={`${name} profile`}><img src={logo} alt={name} loading="lazy" /></a>)}</div>
  </div></section>
}

function CredentialsRail({ issuer, items }) {
  const trackRef = useRef(null)
  const dragRef = useRef(null)
  const [active, setActive] = useState(0)
  const getStep = () => {
    const track = trackRef.current
    const card = track?.querySelector('.licenses-record')
    if (!track || !card) return 1
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0
    return card.getBoundingClientRect().width + gap
  }
  const goTo = (index) => {
    const track = trackRef.current
    if (!track) return
    animateRailToIndex(track, index, 1000)
  }
  const scrollByCard = (direction) => goTo(Math.max(0, Math.min(items.length - 1, active + direction)))

  return <div className="licenses-row scroll-reveal" data-command-section={issuer}>
    <div className="licenses-row-heading">
      <h3><span className="issuer-name-full">{issuer}</span><span className="issuer-name-mobile">{issuer === 'Philippine Professional Regulation Commission' ? 'PRC' : issuer}</span></h3>
      {items.length > 1 && <div className="licenses-row-controls" aria-label={`${issuer} credential navigation`}>
        <button className="carousel-arrow" type="button" onClick={() => scrollByCard(-1)} aria-label={`Previous ${issuer} credential`}><ChevronLeft size={18}/></button>
        <button className="carousel-arrow" type="button" onClick={() => scrollByCard(1)} aria-label={`Next ${issuer} credential`}><ChevronRight size={18}/></button>
      </div>}
    </div>
    <div className="licenses-row-track" data-no-page-swipe="true" ref={trackRef}
      onPointerDown={(event) => beginRailDrag(event, dragRef)}
      onPointerMove={(event) => moveRailDrag(event, dragRef)}
      onPointerUp={(event) => finishRailDrag(event, dragRef)}
      onPointerCancel={(event) => cancelRailDrag(event, dragRef)}
      onDragStart={(event) => event.preventDefault()}
      onClickCapture={(event) => { if (dragRef.current?.moved) event.preventDefault(); dragRef.current = null }}
      onScroll={(event) => setActive(Math.max(0, Math.min(items.length - 1, Math.round(event.currentTarget.scrollLeft / getStep()))))}
    >
      {items.map(record => <article className="certification-card licenses-record squircle-card" data-command-section={record.title} key={record.title}>
        <div className="certificate-art"><img src={record.logo} alt={`${record.issuer} logo`} loading="lazy" /></div>
        <div className="certificate-copy"><h3>{record.title}</h3><p>{record.issuer}</p><a className="credential-button" href={record.href} target="_blank" rel="noreferrer">See Credential</a></div>
      </article>)}
    </div>
    {items.length > 1 && <div className="licenses-row-pagination" aria-label={`${issuer} credential ${active + 1} of ${items.length}`}>
      {items.map((item, index) => <button type="button" key={item.title} className={index === active ? 'is-active' : ''} onClick={() => goTo(index)} aria-label={`Show ${item.title}`} />)}
    </div>}
  </div>
}

function LicensesPage({ onBack, isActive = true }) {
  const [filter, setFilter] = useState('All')
  const compactHeader = useCompactHeader(isActive)
  const previousFilter = useRef(filter)
  const records = certifications.map(([title, issuer, logo, href], index) => ({
    title, issuer, logo, href, kind: index < 2 ? 'License' : 'Certificate',
  }))
  useEffect(() => {
    if (previousFilter.current === filter) return
    previousFilter.current = filter
    const rows = [...document.querySelectorAll('.licenses-page .licenses-row.scroll-reveal, .licenses-page .licenses-profile-card.scroll-reveal')]
    rows.forEach(row => row.classList.remove('is-revealed'))
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-revealed')
        currentObserver.unobserve(entry.target)
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' })
    rows.forEach(row => observer.observe(row))
    return () => observer.disconnect()
  }, [filter])

  const issuerName = (issuer) => issuer.includes('Cisco') ? 'Cisco' : issuer.includes('Google') ? 'Google' : issuer
  const visibleRecords = filter === 'All' ? records : records.filter(record => record.kind === filter)
  const rows = (kind) => {
    const byIssuer = new Map()
    visibleRecords.filter(record => record.kind === kind).forEach(record => {
      const name = issuerName(record.issuer)
      if (!byIssuer.has(name)) byIssuer.set(name, [])
      byIssuer.get(name).push(record)
    })
    return [...byIssuer.entries()]
  }

  return <div className="licenses-page">
    <header className={`licenses-nav ${compactHeader ? 'is-compact' : ''}`}>
      <div className="licenses-nav-inner">
        <a className="licenses-back-button" href="/" onClick={onBack} aria-label="Back to portfolio"><ChevronLeft size={18} aria-hidden="true"/></a>
        <h1>Licenses and Certificates</h1>
        <div className="licenses-filters" data-active={filter} role="group" aria-label="Filter credentials">
          {['All', 'License', 'Certificate'].map(option => <button type="button" key={option} aria-pressed={filter === option} className={filter === option ? 'is-selected' : ''} onClick={() => setFilter(option)}>{option === 'All' ? 'All Credentials' : option === 'License' ? 'Licenses' : 'Certificates'}</button>)}
        </div>
      </div>
    </header>
    <div className="licenses-mobile-filter-wrap">
      <div className="licenses-filters" data-active={filter} role="group" aria-label="Filter credentials">
        {['All', 'License', 'Certificate'].map(option => <button type="button" key={option} aria-pressed={filter === option} className={filter === option ? 'is-selected' : ''} onClick={() => setFilter(option)}>{option === 'All' ? 'All Credentials' : option === 'License' ? 'Licenses' : 'Certificates'}</button>)}
      </div>
    </div>
    <main className="licenses-library">
        {['License', 'Certificate'].map((kind) => {
          const issuerRows = rows(kind)
          if (!issuerRows.length) return null
          return <section className="licenses-type-section" data-command-section={kind === 'License' ? 'Licenses' : 'Certificates'} key={kind} aria-label={kind === 'License' ? 'Licenses' : 'Certificates'}>
            <h2 className="licenses-type-title">{kind === 'License' ? 'Licenses' : 'Certificates'}</h2>
            {issuerRows.map(([issuer, items]) => <CredentialsRail issuer={issuer} items={items} key={`${kind}-${issuer}`} />)}
          </section>
        })}
        <section className="licenses-profile-area" data-command-section="Credentials and Learning Profiles" aria-labelledby="licenses-profiles-title">
          <div className="licenses-profiles-heading"><h2 id="licenses-profiles-title">Credentials &amp; Learning Profiles</h2></div>
          <div className="licenses-profiles-grid">
            {platforms.map(([name, href, logo], index) => <a className="platform-card licenses-profile-card squircle-card scroll-reveal" href={href} target="_blank" rel="noreferrer" key={name} aria-label={`${name} profile`} style={{ '--reveal-delay': `${index * 90}ms` }}><img src={logo} alt={name} loading="lazy"/></a>)}
          </div>
        </section>
    </main>
  </div>
}

function Affiliation() {
  return <section className="section affiliation-section" id="affiliation" data-command-section="Affiliation"><div className="container"><SectionTitle>Affiliation</SectionTitle><article className="affiliation-card feature-card squircle-card"><a className="affiliation-photo-link" href="https://iecepnational.com/" target="_blank" rel="noreferrer" aria-label="Visit the Institute of Electronics Engineers of the Philippines"><Photo src="/images/optimized/affiliation.jpg" alt="IECEP membership event" className="affiliation-photo"/></a><div className="affiliation-copy"><Logo src="/images/affiliation/iecep-national-logo.png" label="IECEP"/><span className="eyebrow blue">Member</span><h3>Institute of Electronics Engineers of the Philippines, Inc.</h3><time>2025</time></div></article></div></section>
}
function Footer({ onHome, onNavigate, homePage }) {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const isHome = homePage ?? path === '/'
  const onPage = path !== '/'
  return <footer className="footer">
    {isHome && <><div className="footer-connect"><h2>Let’s Connect</h2><a href={email}>jcdcocampo@gmail.com</a><a className="footer-email-button" href={email}>Send Email</a></div><div className="footer-divider"/></>}
    <div className="footer-bottom"><nav aria-label="Footer navigation"><a href={onPage ? '/' : '#home'} onClick={onPage ? onHome : undefined}>Home</a><a href={portfolioPathForPage('privacy')} onClick={(event) => onNavigate?.(event, 'privacy')}>Privacy Policy</a><a href={portfolioPathForPage('terms')} onClick={(event) => onNavigate?.(event, 'terms')}>Terms and Conditions</a></nav><p>© 2026 Jose Carlo David Ocampo. All rights reserved.</p></div>
  </footer>
}
export default function App() {
  const [currentPage, setCurrentPage] = useState(portfolioPageFromLocation)
  const [pageReloadKeys, setPageReloadKeys] = useState({})
  const [preloadedSwipePages, setPreloadedSwipePages] = useState([])
  const [isMobileViewport, setIsMobileViewport] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const currentPageRef = useRef(currentPage)
  const mobileViewportRef = useRef(isMobileViewport)
  currentPageRef.current = currentPage
  mobileViewportRef.current = isMobileViewport
  const [showSwipeNeighbors, setShowSwipeNeighbors] = useState(false)
  const returnToTop = useRef(false)
  const stopWheelScroll = useRef(() => {})
  const initialSwipeIndex = mobileSwipePages.indexOf(currentPage)
  const pageSwipeX = useMotionValue(isMobileViewport && initialSwipeIndex >= 0 ? -initialSwipeIndex * window.innerWidth : 0)
  const pageSwipeViewportRef = useRef(null)
  const pageSwipeGesture = useRef(null)
  const [swipeHeaderCompact, setSwipeHeaderCompact] = useState(false)
  const pageSwipeAnimation = useRef(null)
  const pendingPageSwipe = useRef(null)
  const committingPageSwipe = useRef(false)
  const pageSwipeNavTracking = useRef(false)
  const suppressPageSwipeClickUntil = useRef(0)
  const pageScrollPositions = useRef({})
  const swipeRouteChange = useRef(false)
  const pageSwipeBase = () => isMobileViewport && mobileSwipePages.includes(currentPage) ? -mobileSwipePages.indexOf(currentPage) * window.innerWidth : 0
  const syncSwipeHeaderSize = () => {
    const header = pageSwipeViewportRef.current?.querySelector('.page-swipe-panel.page-swipe-current .projects-nav, .page-swipe-panel.page-swipe-current .licenses-nav')
    setSwipeHeaderCompact(Boolean(header?.classList.contains('is-compact')))
  }
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const updateViewport = () => {
      const mobile = media.matches
      const page = currentPageRef.current
      const pageIndex = mobileSwipePages.indexOf(page)
      pageSwipeX.set(mobile && pageIndex >= 0 ? -pageIndex * window.innerWidth : 0)
      setIsMobileViewport(mobile)
    }
    updateViewport()
    media.addEventListener?.('change', updateViewport)
    window.addEventListener('resize', updateViewport, { passive: true })
    return () => {
      media.removeEventListener?.('change', updateViewport)
      window.removeEventListener('resize', updateViewport)
    }
  }, [])
  const cancelPageSwipe = () => {
    pageSwipeGesture.current = null
    pageSwipeAnimation.current?.stop()
    pageSwipeAnimation.current = null
    pendingPageSwipe.current = null
    pageSwipeNavTracking.current = false
    setShowSwipeNeighbors(false)
    pageSwipeX.set(pageSwipeBase())
    window.__resetPortfolioNavSwipe?.()
  }
  useEffect(() => pageSwipeX.on('change', (x) => {
    if (!pageSwipeNavTracking.current) return
    if (!mobileViewportRef.current) return
    const position = Math.max(0, Math.min(mobileSwipePages.length - 1, -x / Math.max(1, window.innerWidth)))
    const fromIndex = Math.min(mobileSwipePages.length - 2, Math.floor(position))
    const toIndex = fromIndex + 1
    window.__setPortfolioNavSwipeProgress?.(mobileSwipePages[fromIndex], mobileSwipePages[toIndex], position - fromIndex)
  }), [pageSwipeX])
  const onPageSwipePointerDown = (event) => {
    if (event.pointerType === 'touch' || !window.matchMedia('(max-width: 767px)').matches) return
    if (!mobileSwipePages.includes(currentPage) || isPageSwipeExcluded(event.target, event.currentTarget)) return
    const now = performance.now()
    pageSwipeGesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: now,
      velocityX: 0,
      axis: null,
      baseX: pageSwipeBase(),
    }
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch {}
  }
  const onPageSwipePointerMove = (event) => {
    if (event.pointerType === 'touch') return
    const gesture = pageSwipeGesture.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    const dx = event.clientX - gesture.startX
    const dy = event.clientY - gesture.startY
    const now = performance.now()
    if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
      if (Math.abs(dy) > Math.abs(dx) * 1.12) {
        pageSwipeGesture.current = null
        return
      }
      if (Math.abs(dx) > Math.abs(dy) * 1.12) {
        gesture.axis = 'x'
        pageSwipeNavTracking.current = true
        syncSwipeHeaderSize()
        setShowSwipeNeighbors(true)
      }
    }
    if (gesture.axis !== 'x') return
    if (event.cancelable) event.preventDefault()
    const elapsed = Math.max(1, now - gesture.lastTime)
    gesture.velocityX = (event.clientX - gesture.lastX) / elapsed
    gesture.lastX = event.clientX
    gesture.lastTime = now
    const index = mobileSwipePages.indexOf(currentPage)
    const atEdge = (dx < 0 && index === mobileSwipePages.length - 1) || (dx > 0 && index === 0)
    const boundedDx = atEdge
      ? Math.sign(dx) * Math.min(Math.abs(dx) * 0.2, window.innerWidth * 0.16)
      : Math.max(-window.innerWidth, Math.min(window.innerWidth, dx))
    pageSwipeX.set(gesture.baseX + boundedDx)
  }
  const settlePageSwipe = () => {
    pageSwipeGesture.current = null
    pageSwipeAnimation.current?.stop()
    const animation = animate(pageSwipeX, pageSwipeBase(), { type: 'spring', stiffness: 240, damping: 30, mass: 0.85 })
    pageSwipeAnimation.current = animation
    animation.then(() => {
      if (pageSwipeAnimation.current !== animation) return
      pageSwipeAnimation.current = null
      pageSwipeNavTracking.current = false
      setShowSwipeNeighbors(false)
      window.__resetPortfolioNavSwipe?.()
    })
  }
  const onPageSwipePointerUp = (event) => {
    if (event.pointerType === 'touch') return
    const gesture = pageSwipeGesture.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    if (gesture.axis === 'x') suppressPageSwipeClickUntil.current = performance.now() + 500
    const offset = pageSwipeX.get() - gesture.baseX
    const velocity = gesture.velocityX * 1000
    const width = window.innerWidth
    const shouldChangePage = Math.abs(offset) >= width * 0.2 || (Math.abs(velocity) >= 650 && Math.abs(offset) >= 28)
    const currentIndex = mobileSwipePages.indexOf(currentPage)
    const swipeSign = Math.abs(offset) >= 18 ? Math.sign(offset) : Math.sign(velocity)
    const direction = swipeSign < 0 ? 1 : -1
    const destinationIndex = shouldChangePage
      ? Math.max(0, Math.min(mobileSwipePages.length - 1, currentIndex + direction))
      : currentIndex
    const destination = mobileSwipePages[destinationIndex]
    if (gesture.axis !== 'x' || !shouldChangePage || destinationIndex === currentIndex || !destination) {
      settlePageSwipe()
      return
    }

    pageSwipeGesture.current = null
    pendingPageSwipe.current = { destination }
    pageSwipeAnimation.current?.stop()
    const animation = animate(pageSwipeX, -destinationIndex * width, { type: 'spring', stiffness: 240, damping: 30, mass: 0.85 })
    pageSwipeAnimation.current = animation
    animation.then(() => {
      if (pageSwipeAnimation.current !== animation || pendingPageSwipe.current?.destination !== destination) return
      pageSwipeAnimation.current = null
      pageSwipeNavTracking.current = false
      pageScrollPositions.current[currentPage] = window.scrollY
      swipeRouteChange.current = true
      committingPageSwipe.current = true
      window.__navSwipeSettledId = destination === 'licenses' ? 'certs' : destination
      navigateTo(null, destination)
      committingPageSwipe.current = false
    })
  }
  const onPageSwipePointerCancel = (event) => {
    if (event.pointerType === 'touch') return
    if (pageSwipeGesture.current?.pointerId === event.pointerId) settlePageSwipe()
  }
  useEffect(() => {
    const viewport = pageSwipeViewportRef.current
    if (!viewport || !isMobileViewport || !mobileSwipePages.includes(currentPage)) return
    const onTouchStart = (event) => {
      pageSwipeGesture.current = null
      suppressPageSwipeClickUntil.current = 0
      if (event.touches.length !== 1 || isPageSwipeExcluded(event.target, viewport)) return
      const touch = event.touches[0]
      pageSwipeGesture.current = { pointerId: touch.identifier, startX: touch.clientX, startY: touch.clientY, lastX: touch.clientX, lastTime: performance.now(), velocityX: 0, axis: null, baseX: pageSwipeBase() }
    }
    const onTouchMove = (event) => {
      const gesture = pageSwipeGesture.current
      if (!gesture) return
      const touch = Array.from(event.touches).find((item) => item.identifier === gesture.pointerId)
      if (!touch) return
      const dx = touch.clientX - gesture.startX
      const dy = touch.clientY - gesture.startY
      const now = performance.now()
      if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
        if (Math.abs(dy) > Math.abs(dx) * 1.12) { pageSwipeGesture.current = null; return }
        if (Math.abs(dx) > Math.abs(dy) * 1.12) { gesture.axis = 'x'; pageSwipeNavTracking.current = true; syncSwipeHeaderSize(); setShowSwipeNeighbors(true) }
      }
      if (gesture.axis !== 'x') return
      event.preventDefault()
      const elapsed = Math.max(1, now - gesture.lastTime)
      gesture.velocityX = (touch.clientX - gesture.lastX) / elapsed
      gesture.lastX = touch.clientX
      gesture.lastTime = now
      const index = mobileSwipePages.indexOf(currentPage)
      const atEdge = (dx < 0 && index === mobileSwipePages.length - 1) || (dx > 0 && index === 0)
      const boundedDx = atEdge
        ? Math.sign(dx) * Math.min(Math.abs(dx) * 0.2, window.innerWidth * 0.16)
        : Math.max(-window.innerWidth, Math.min(window.innerWidth, dx))
      pageSwipeX.set(gesture.baseX + boundedDx)
    }
    const onTouchEnd = (event) => {
      const gesture = pageSwipeGesture.current
      if (!gesture || !Array.from(event.changedTouches).some((touch) => touch.identifier === gesture.pointerId)) return
      if (gesture.axis === 'x') suppressPageSwipeClickUntil.current = performance.now() + 500
      onPageSwipePointerUp({ pointerId: gesture.pointerId })
    }
    const onTouchCancel = () => { if (pageSwipeGesture.current) settlePageSwipe() }
    const onClickCapture = (event) => {
      if (performance.now() > suppressPageSwipeClickUntil.current) return
      suppressPageSwipeClickUntil.current = 0
      event.preventDefault()
      event.stopPropagation()
    }
    viewport.addEventListener('touchstart', onTouchStart, { passive: true })
    viewport.addEventListener('touchmove', onTouchMove, { passive: false })
    viewport.addEventListener('touchend', onTouchEnd, { passive: true })
    viewport.addEventListener('touchcancel', onTouchCancel, { passive: true })
    viewport.addEventListener('click', onClickCapture, true)
    return () => {
      viewport.removeEventListener('touchstart', onTouchStart)
      viewport.removeEventListener('touchmove', onTouchMove)
      viewport.removeEventListener('touchend', onTouchEnd)
      viewport.removeEventListener('touchcancel', onTouchCancel)
      viewport.removeEventListener('click', onClickCapture, true)
    }
  }, [currentPage, isMobileViewport, pageSwipeX])
  const navigateTo = (event, destination) => {
    event?.preventDefault()
    const buttonNavigation = !committingPageSwipe.current && mobileSwipePages.includes(destination)
    if (buttonNavigation) {
      setPageReloadKeys((keys) => ({ ...keys, [destination]: (keys[destination] || 0) + 1 }))
      setPreloadedSwipePages((pages) => pages.filter((page) => page !== destination))
      pageScrollPositions.current[destination] = 0
      const destinationPanel = document.querySelector(`.page-swipe-panel[data-page="${destination}"]`)
      destinationPanel?.querySelectorAll('.scroll-reveal, .project-page-reveal').forEach((element) => element.classList.remove('is-revealed'))
      if (destination === currentPage) {
        stopWheelScroll.current()
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        return
      }
    }
    if (destination === currentPage) return
    if (mobileSwipePages.includes(currentPage)) pageScrollPositions.current[currentPage] = window.scrollY
    if (!committingPageSwipe.current && (pageSwipeGesture.current || pageSwipeAnimation.current || pendingPageSwipe.current)) cancelPageSwipe()
    if (!committingPageSwipe.current && mobileSwipePages.includes(destination)) {
      const destinationPanel = document.querySelector(`.page-swipe-panel[data-page="${destination}"]`)
      destinationPanel?.classList.remove('page-swipe-preloaded')
      destinationPanel?.querySelectorAll('.scroll-reveal, .project-page-reveal').forEach((element) => element.classList.remove('is-revealed'))
    } else if (committingPageSwipe.current && mobileSwipePages.includes(destination)) {
      const destinationPanel = document.querySelector(`.page-swipe-panel[data-page="${destination}"]`)
      setPreloadedSwipePages((pages) => pages.includes(destination) ? pages : [...pages, destination])
      destinationPanel?.querySelectorAll('.scroll-reveal, .project-page-reveal').forEach((element) => element.classList.add('is-revealed'))
    }
    stopWheelScroll.current()
    const previousPortfolioPage = currentPage
    if (destination !== 'home') {
      if (destination.startsWith('project:')) {
        const slug = destination.slice('project:'.length)
        window.history.pushState({ page: 'project', project: slug, portfolioRoute: true, previousPortfolioPage }, '', portfolioPathForPage(destination))
      } else {
        window.history.pushState({ page: destination, portfolioRoute: true, previousPortfolioPage }, '', portfolioPathForPage(destination))
      }
    } else {
      returnToTop.current = true
      window.history.pushState({ page: 'home', portfolioRoute: true, previousPortfolioPage }, '', '/')
      setCurrentPage('home')
      return
    }
    setCurrentPage(destination)
  }
  const navigateBack = (event, fallback = 'home') => {
    event?.preventDefault()
    const historyEntry = window.history.state
    if (historyEntry?.portfolioRoute && historyEntry.previousPortfolioPage) {
      stopWheelScroll.current()
      window.history.back()
      return
    }
    navigateTo(null, fallback)
  }
  useLayoutEffect(() => {
    if (swipeRouteChange.current && mobileSwipePages.includes(currentPage)) {
      window.scrollTo({ top: pageScrollPositions.current[currentPage] || 0, left: 0, behavior: 'instant' })
      swipeRouteChange.current = false
      return
    }
    if (currentPage !== 'home' || returnToTop.current) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      returnToTop.current = false
    }
  }, [currentPage])
  useLayoutEffect(() => {
    pageSwipeAnimation.current?.stop()
    pageSwipeAnimation.current = null
    pendingPageSwipe.current = null
    pageSwipeGesture.current = null
    pageSwipeNavTracking.current = false
    setShowSwipeNeighbors(false)
    pageSwipeX.set(pageSwipeBase())
  }, [currentPage, isMobileViewport, pageSwipeX])
  const isProjectArticlePage = currentPage.startsWith('project:')
  const projectArticleSlug = isProjectArticlePage ? currentPage.slice('project:'.length) : ''
  const isLegalPage = currentPage === 'privacy' || currentPage === 'terms'
  const isNotFoundPage = currentPage === 'not-found'
  useEffect(() => {
    const pageTitles = {
      home: 'Engr. Jose Carlo David Ocampo',
      experience: 'Experience',
      projects: 'Projects',
      licenses: 'Licenses and Certifications',
      mian: 'Mian: An Intelligent Portfolio Assistant',
      privacy: 'Privacy Policy',
      terms: 'Terms and Conditions',
      'not-found': 'Error 404',
    }
    const pageTitle = isProjectArticlePage
      ? institutionalProjectArticles[projectArticleSlug]?.title || 'Project'
      : pageTitles[currentPage] || 'Home'
    document.title = currentPage === 'not-found' || currentPage === 'home'
      ? pageTitle
      : `${pageTitle} | Engr. Jose Carlo David Ocampo`
  }, [currentPage, isProjectArticlePage, projectArticleSlug])
  useEffect(() => {
    const descriptions = {
      home: 'The portfolio of Engr. Jose Carlo David Ocampo, Application & Cloud Support Associate and Electronics Engineer.',
      projects: 'Selected personal projects, institutional research, and engineering work by Jose Carlo David Ocampo.',
      mian: 'Meet Mian, an intelligent portfolio assistant built to make exploring a personal portfolio more conversational.',
      licenses: 'Professional licenses, certificates, and learning profiles of Engr. Jose Carlo David Ocampo.',
      experience: 'Professional experience and career history of Engr. Jose Carlo David Ocampo.',
      privacy: 'Privacy policy for the portfolio website and Mian AI assistant.',
      terms: 'Terms and conditions for the portfolio website and Mian AI assistant.',
      'not-found': 'The requested page could not be found.',
    }
    const routeUrl = new URL(window.location.href)
    routeUrl.hash = ''
    const canonical = document.querySelector('link[rel="canonical"]')
    canonical?.setAttribute('href', routeUrl.href)
    const description = isProjectArticlePage
      ? institutionalProjectArticles[projectArticleSlug]?.subtitle || descriptions['not-found']
      : descriptions[currentPage] || descriptions.home
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', routeUrl.href)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', document.title)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description)
  }, [currentPage, isProjectArticlePage, projectArticleSlug])
  useEffect(() => {
    const navId = currentPage === 'licenses' ? 'certs' : currentPage === 'mian' || currentPage.startsWith('project:') ? 'projects' : isLegalPage || isNotFoundPage ? 'home' : currentPage
    window.__navActive = navId
    window.__portfolioNavigate = (id) => {
      const destination = id === 'certs' || id === 'licenses' ? 'licenses' : id
      navigateTo(null, destination)
    }
    window.__setPortfolioNavActive?.(navId)
  }, [currentPage])
  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    // Mark the starting home entry so the in-app back button can return through
    // the same history stack that the browser's Back and Forward buttons use.
    const initialPage = portfolioPageFromLocation()
    if (initialPage !== 'not-found') {
      const path = portfolioPathForPage(initialPage)
      const pageState = initialPage.startsWith('project:')
        ? { page: 'project', project: initialPage.slice('project:'.length) }
        : { page: initialPage }
      if (window.location.pathname !== path || window.location.search) {
        window.history.replaceState({ ...(window.history.state || {}), ...pageState, portfolioRoute: true }, '', `${path}${window.location.hash}`)
      }
    }
    if (initialPage === 'home') {
      window.history.replaceState({ ...(window.history.state || {}), page: 'home', portfolioRoute: true }, '', window.location.href)
    }
    const onPopState = () => {
      cancelPageSwipe()
      stopWheelScroll.current()
      const nextPage = portfolioPageFromLocation()
      if (nextPage === 'home') returnToTop.current = true
      setCurrentPage(nextPage)
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      window.history.scrollRestoration = previousRestoration
    }
  }, [])
  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0, active = false, current = window.scrollY, target = current, lastFrame = 0, lastApplied = current
    const referenceFrame = 1000 / 60
    const sync = (position = window.scrollY) => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      current = target = lastApplied = Math.min(max, Math.max(0, position))
      lastFrame = 0
    }
    const hasNestedScroller = (node) => {
      let element = node instanceof Element ? node : node?.parentElement
      if (element?.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return true
      while (element && element !== document.body && element !== document.documentElement) {
        const { overflowY } = getComputedStyle(element)
        if (/^(auto|scroll|overlay)$/.test(overflowY) && element.scrollHeight > element.clientHeight + 1) return true
        element = element.parentElement
      }
      return false
    }
    const stop = (resync = true) => { if (frame) cancelAnimationFrame(frame); frame = 0; active = false; lastFrame = 0; if (resync) sync() }
    stopWheelScroll.current = () => stop()
    const step = (now) => {
      if (mobileQuery.matches || reducedMotionQuery.matches) { stop(); return }
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      target = Math.min(max, Math.max(0, target))
      const elapsed = lastFrame ? Math.min(50, now - lastFrame) : referenceFrame
      lastFrame = now
      const blend = 1 - Math.pow(1 - .085, elapsed / referenceFrame)
      const difference = target - current
      current += difference * blend
      if (Math.abs(difference) < .45) { current = target; lastApplied = current; window.scrollTo(0, current); stop(); return }
      lastApplied = current; window.scrollTo(0, current); frame = requestAnimationFrame(step)
    }
    const onWheel = (event) => {
      if (mobileQuery.matches || reducedMotionQuery.matches || event.defaultPrevented || !event.cancelable || event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.deltaY === 0 || hasNestedScroller(event.target)) return
      let delta = event.deltaY
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        const node = event.target instanceof Element ? event.target : event.target?.parentElement
        delta *= Number.parseFloat(node ? getComputedStyle(node).lineHeight : '') || 16
      } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= window.innerHeight
      if (!Number.isFinite(delta) || delta === 0) return
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      if (!active) sync()
      const next = Math.min(max, Math.max(0, target + delta))
      if (next === target) return
      event.preventDefault(); target = next; active = true
      if (!frame) frame = requestAnimationFrame(step)
    }
    const onScroll = () => { if (active) { if (Math.abs(window.scrollY - lastApplied) > 2) stop(); return } sync() }
    const interrupt = () => stop()
    const onResize = () => { const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight); target = Math.min(max, Math.max(0, target)); current = Math.min(max, Math.max(0, current)); if (!active) sync() }
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(onResize) : null
    resizeObserver?.observe(document.documentElement)
    if (document.body) resizeObserver?.observe(document.body)
    sync()
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('touchstart', interrupt, { passive: true })
    window.addEventListener('pointerdown', interrupt, { passive: true })
    window.addEventListener('keydown', interrupt)
    mobileQuery.addEventListener?.('change', onResize)
    reducedMotionQuery.addEventListener?.('change', interrupt)
    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('wheel', onWheel); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize)
      window.removeEventListener('touchstart', interrupt); window.removeEventListener('pointerdown', interrupt); window.removeEventListener('keydown', interrupt)
      mobileQuery.removeEventListener?.('change', onResize); reducedMotionQuery.removeEventListener?.('change', interrupt)
      stop()
      stopWheelScroll.current = () => {}
    }
  }, [])
  useLayoutEffect(() => {
    const squircleCards = document.querySelectorAll('.squircle-card')
    const applySquircle = (element) => {
      // Use layout dimensions, not the visual rect: chat surfaces animate with
      // scale transforms, which would otherwise leave a permanently undersized clip path.
      const width = element.offsetWidth
      const height = element.offsetHeight
      if (width < 2 || height < 2) return
      const styles = getComputedStyle(element)
      const radius = Number.parseFloat(styles.getPropertyValue('--corner-radius')) || 42
      const smoothing = Number.parseFloat(styles.getPropertyValue('--corner-smoothing')) || 0.75
      const path = getSquirclePath(width, height, radius, smoothing)
      element.style.clipPath = `path("${path}")`
      element.style.webkitClipPath = `path("${path}")`
    }
    squircleCards.forEach(applySquircle)
    const resizeObserver = new ResizeObserver((entries) => entries.forEach(({ target }) => applySquircle(target)))
    squircleCards.forEach((element) => resizeObserver.observe(element))
    const observeAddedSquircles = (node) => {
      if (!(node instanceof Element)) return
      if (node.matches('.squircle-card')) { applySquircle(node); resizeObserver.observe(node) }
      node.querySelectorAll?.('.squircle-card').forEach((element) => { applySquircle(element); resizeObserver.observe(element) })
    }
    const squircleMutations = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach(observeAddedSquircles)))
    squircleMutations.observe(document.body, { childList: true, subtree: true })

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let observer
    let targets = []
    if (!reduceMotion) {
      document.documentElement.classList.add('motion-ready')
      targets = [...document.querySelectorAll(
        '.hero-content > h1, .hero-content > .hero-role, .hero-content > .hero-location, .hero-actions > *, .section-title, .experience-card, .education-feature, .education-card, .project-feature, .project-card, .view-all, .certification-heading, .certification-carousel, .licenses-type-title, .licenses-profiles-heading, .licenses-row, .licenses-profile-card, .platform-heading, .platform-card, .affiliation-card'
      )]
      const staggerCounts = new Map()
      targets.forEach((element) => {
        element.classList.add('scroll-reveal')
        if (!element.style.getPropertyValue('--reveal-delay')) {
          const group = element.closest('.licenses-type-section, .licenses-profiles-grid, .container, main') || element.parentElement
          const count = staggerCounts.get(group) || 0
          element.style.setProperty('--reveal-delay', `${Math.min(count, 5) * 90}ms`)
          staggerCounts.set(group, count + 1)
        }
      })
      observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-revealed')
          currentObserver.unobserve(entry.target)
        })
      }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' })
      targets.forEach(element => observer.observe(element))
    }

    return () => {
      observer?.disconnect()
      resizeObserver.disconnect()
      squircleMutations.disconnect()
      document.documentElement.classList.remove('motion-ready')
    }
  }, [currentPage, pageReloadKeys])

  const renderRoutePage = (page) => {
    const footer = (homePage = page === 'home') => <Footer homePage={homePage} onHome={(event) => navigateTo(event, 'home')} onNavigate={(event, destination) => navigateTo(event, destination)} />
    if (page === 'not-found') return <><NotFoundPage onBack={(event) => navigateTo(event, 'home')} />{footer(false)}</>
    if (page === 'privacy' || page === 'terms') return <><LegalPage type={page} onBack={(event) => navigateTo(event, 'home')} />{footer(false)}</>
    if (page.startsWith('project:')) return <><ProjectArticlePage slug={page.slice('project:'.length)} onBack={(event) => navigateBack(event, 'projects')} />{footer(false)}</>
    if (page === 'mian') return <><MianProjectPage onBack={(event) => navigateBack(event, 'projects')} />{footer(false)}</>
    if (page === 'licenses') return <><LicensesPage isActive={page === currentPage} onBack={(event) => navigateBack(event, 'home')} />{footer(false)}</>
    if (page === 'projects') return <><ProjectsPage isActive={page === currentPage} onBack={(event) => navigateBack(event, 'home')} onMianClick={(event) => navigateTo(event, 'mian')} onProjectClick={(event, slug) => navigateTo(event, `project:${slug}`)} />{footer(false)}</>
    if (page === 'experience') return <><ExperiencePage isActive={page === currentPage} onBack={(event) => navigateBack(event, 'home')} />{footer(false)}</>
    return <><Hero/><main><Experience/><Education/><Projects onMianClick={(event) => navigateTo(event, 'mian')} onProjectClick={(event, slug) => navigateTo(event, `project:${slug}`)} onViewAll={(event) => navigateTo(event, 'projects')}/><Certifications onViewAll={(event) => navigateTo(event, 'licenses')}/><Affiliation/></main>{footer(true)}</>
  }
  const mobileTabIndex = mobileSwipePages.indexOf(currentPage)
  const useMobilePager = isMobileViewport && mobileTabIndex >= 0

  return <>
    <div className="page-wrap">
      {useMobilePager
        ? <div className={`page-swipe-viewport${showSwipeNeighbors ? ` is-swiping${swipeHeaderCompact ? ' is-header-compact' : ''}` : ''}`} ref={pageSwipeViewportRef} onPointerDownCapture={onPageSwipePointerDown} onPointerMoveCapture={onPageSwipePointerMove} onPointerUpCapture={onPageSwipePointerUp} onPointerCancelCapture={onPageSwipePointerCancel}>
            <motion.div className="page-swipe-track" style={{ x: pageSwipeX }}>
              {mobileSwipePages.map((page, index) => {
                const active = page === currentPage
                const swipeOffsetY = !active && showSwipeNeighbors
                  ? window.scrollY - (pageScrollPositions.current[page] || 0)
                  : 0
                return <div className={`page-swipe-panel${active ? ' page-swipe-current' : ''}${preloadedSwipePages.includes(page) ? ' page-swipe-preloaded' : ''}`} style={{ '--panel-index': index }} data-page={page} data-index={index} aria-hidden={!active} inert={!active} key={page}>
                  <div className="page-swipe-panel-content" style={swipeOffsetY ? { '--page-swipe-y': `${swipeOffsetY}px`, '--page-swipe-header-y': `${-swipeOffsetY}px`, transform: `translateY(${swipeOffsetY}px)` } : undefined}>
                    <div className="page-route-instance" key={`${page}-${pageReloadKeys[page] || 0}`}>{renderRoutePage(page)}</div>
                  </div>
                </div>
              })}
            </motion.div>
          </div>
        : renderRoutePage(currentPage)}
    </div>
    <FloatingNavigation />
  </>
}


