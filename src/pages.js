// The inner pages (About, Projects, Experience, Blogs). They sit on top of the landing page:
// the first one grows out of the nav link as a circle, the same way the landing page opens,
// and the rest cross-fade in place. Esc, the back button or the name in the corner return to the portrait.

import { CONTACT, ABOUT, ACADEX, PROJECTS, EXPERIENCE, BLOGS, LIFE } from './content.js';

const page = document.getElementById('page');
const scroller = page.querySelector('.page-scroll');
const body = page.querySelector('.page-body');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const ARROW = '<span class="arr" aria-hidden="true">&#8599;</span>';
const ext = (href, label, cls = 'link') => `<a class="${cls}" href="${href}" target="_blank" rel="noopener">${label} ${ARROW}</a>`;
const chips = (list, cls = 'chip') => list.map((s) => `<span class="${cls}">${s}</span>`).join('');
const kicker = (n, t) => `<p class="kicker"><span>${n}</span>${t}</p>`;

let current = null, origin = { x: innerWidth / 2, y: innerHeight / 2 }, timers = [];
const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
const every = (fn, ms) => { const id = setInterval(fn, ms); timers.push(id); return id; };
const clearTimers = () => { timers.forEach((id) => { clearTimeout(id); clearInterval(id); }); timers = []; };

/* ---------- pages ---------- */

function contactBlock() {
  return `
  <section class="pg-contact reveal">
    <h2>Let's build something,<br />or just talk.</h2>
    <p>I'm always happy to chat about products, AI, startups or writing. The easiest way is a quick call, and I promise it won't feel like an interview.</p>
    <div class="cta-row">
      ${ext(CONTACT.cal, 'Book a call', 'btn primary')}
      <button type="button" class="btn" data-copy="${CONTACT.email}">Copy my email</button>
    </div>
    <div class="socials">
      <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>
      ${ext(CONTACT.linkedin, 'LinkedIn')}
      ${ext(CONTACT.x, 'X')}
      ${ext(CONTACT.github, 'GitHub')}
    </div>
    <button type="button" class="back-home" data-home><span aria-hidden="true">&larr;</span> Back to the portrait</button>
  </section>`;
}

function about() {
  const skillCats = ABOUT.skills.map((s) => s.cat);
  return `
  <section class="pg-hero reveal">
    ${kicker('01', 'About')}
    <h1 class="pg-title">${ABOUT.lead}</h1>
    <p class="aka"><span class="mini">Also known as</span> <b>Moryasshan</b><br />${ABOUT.aka}</p>
  </section>

  <section class="about-grid reveal">
    <div class="about-text">${ABOUT.intro.map((p) => `<p>${p}</p>`).join('')}</div>
    <aside class="now spot">
      <p class="mini">Right now</p>
      <ul>
        <li><i class="live"></i><span>Building <b>Acadex</b> at Ereefian</span></li>
        <li><i></i><span>B.Tech CSE at <b>IIIT Bhubaneswar</b>, 2024 to 2028</span></li>
        <li><i></i><span>Selected for the <b>McKinsey Forward Learning Program</b></span></li>
        <li><i></i><span>Writing about <b>AI & startups</b></span></li>
      </ul>
    </aside>
  </section>

  <section class="stats reveal">
    ${ABOUT.stats.map((s) => `
      <div class="stat spot">
        <b data-count="${s.n}" data-suffix="${s.suffix}">0${s.suffix}</b>
        <span>${s.label}</span>
      </div>`).join('')}
  </section>

  <section class="block reveal">
    <h2 class="h2">Four sides of me</h2>
    <p class="sub">Pick one. They all end up in the same place: things people actually use.</p>
    <div class="seg" role="tablist" data-group="modes">
      ${ABOUT.modes.map((m, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-mode="${m.key}">${m.label}</button>`).join('')}
    </div>
    <div class="mode-panel spot" data-panel="modes"></div>
  </section>

  <section class="block reveal">
    <h2 class="h2">My toolbox</h2>
    <p class="sub">Tap a group to see what's in it.</p>
    <div class="filters" data-group="skills">
      <button type="button" class="on" data-skill="all">Everything</button>
      ${skillCats.map((c) => `<button type="button" data-skill="${c}">${c}</button>`).join('')}
    </div>
    <div class="cloud">
      ${ABOUT.skills.map((s) => s.items.map((it) => `<span class="pill" data-cat="${s.cat}">${it}</span>`).join('')).join('')}
    </div>
  </section>
  ${contactBlock()}`;
}

function modePanel(key) {
  const m = ABOUT.modes.find((x) => x.key === key);
  return `<h3>${m.title}</h3><p>${m.body}</p><div class="chips">${chips(m.points)}</div>`;
}

function projects() {
  return `
  <section class="pg-hero reveal">
    ${kicker('02', 'Projects')}
    <h1 class="pg-title">Things I've built, shipped and cared about.</h1>
    <p class="pg-lead">One star project I work on every day, and three I built from scratch. Every one of them taught me something new.</p>
  </section>

  <article class="star reveal">
    <div class="star-head">
      <p class="badge"><span aria-hidden="true">&#9733;</span> Star project</p>
      <h2>Acadex</h2>
      <p class="star-tag">${ACADEX.tagline} <span>Full Stack Engineer · Ereefian</span></p>
      <div class="link-row">${ext(ACADEX.url, 'acadex.ereefian.com', 'btn primary')}</div>
    </div>

    <div class="star-grid">
      <div class="prose">${ACADEX.body.map((p) => `<p>${p}</p>`).join('')}</div>
      <div class="who spot">
        <p class="mini">Built for</p>
        <div class="seg small" role="tablist" data-group="acadex-roles">
          ${ACADEX.roles.map((r, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-arole="${r.key}">${r.label}</button>`).join('')}
        </div>
        <p class="who-text" data-panel="acadex-roles">${ACADEX.roles[0].text}</p>
      </div>
    </div>

    <div class="journey">
      <div class="journey-head">
        <h3 class="h3">How a feature travels, from idea to live</h3>
        <button type="button" class="ghost" data-journey-play>Play</button>
      </div>
      <div class="steps" role="tablist">
        ${ACADEX.steps.map((s, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-step="${i}"><i>${String(i + 1).padStart(2, '0')}</i>${s.t}</button>`).join('')}
        <span class="steps-bar"><span></span></span>
      </div>
      <p class="step-text" data-panel="steps">${ACADEX.steps[0].d}</p>
    </div>

    <h3 class="h3">What I owned</h3>
    <div class="owned">
      ${ACADEX.owned.map((o, i) => `<div class="card spot"><i>${String(i + 1).padStart(2, '0')}</i><h4>${o.t}</h4><p>${o.d}</p></div>`).join('')}
    </div>

    <div class="writing spot">
      <div>
        <p class="mini">Writing Head</p>
        <h3>${ACADEX.writing.title}</h3>
        <p>${ACADEX.writing.body}</p>
      </div>
      <ul>${ACADEX.writing.items.map((w) => `<li>${w}</li>`).join('')}</ul>
    </div>

    <div class="stack"><span class="mini">Stack</span>${chips(ACADEX.stack)}</div>
  </article>

  <section class="block reveal">
    <h2 class="h2">More things I built</h2>
    <p class="sub">Pick a project. Each one has a small live piece you can play with.</p>
    <div class="proj-tabs" role="tablist">
      ${PROJECTS.map((p, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-proj="${p.key}"><b>${p.name}</b><span>${p.kind}</span></button>`).join('')}
    </div>
    <div class="proj-panel" data-panel="proj"></div>
  </section>
  ${contactBlock()}`;
}

function projectPanel(key) {
  const p = PROJECTS.find((x) => x.key === key);
  const links = [ext(p.repo, 'GitHub', 'btn')];
  if (p.live) links.unshift(ext(p.live, p.live.replace('https://', ''), 'btn primary'));
  return `
    <div class="proj-top">
      <div>
        <h3 class="proj-name">${p.name}</h3>
        <p class="proj-tag">${p.tagline}</p>
      </div>
      <div class="link-row">${links.join('')}</div>
    </div>
    <div class="proj-stats">${p.stats.map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('')}</div>
    <div class="proj-grid">
      <div class="prose">${p.body.map((x) => `<p>${x}</p>`).join('')}
        <ul class="ticks">${p.extras.map((e) => `<li>${e}</li>`).join('')}</ul>
      </div>
      <div class="demo spot">${demo(p)}</div>
    </div>
    <div class="stack"><span class="mini">Stack</span>${chips(p.stack)}</div>`;
}

function demo(p) {
  if (p.demo === 'pipeline') return `
    <div class="demo-head"><p class="mini">How a single reply happens</p>
      <div><button type="button" class="ghost" data-pipe-play>Talk</button><button type="button" class="ghost" data-pipe-cut>Interrupt</button></div></div>
    <ol class="pipe">${p.pipeline.map((s, i) => `<li><button type="button" data-pipe="${i}">${s.t}</button></li>`).join('')}</ol>
    <p class="demo-text" data-panel="pipe">Press <b>Talk</b> to follow your voice through the pipeline, or tap any stage.</p>`;
  if (p.demo === 'roles') return `
    <div class="demo-head"><p class="mini">Who sees what</p></div>
    <div class="seg small" role="tablist" data-group="jroles">
      ${p.roles.map((r, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-jrole="${i}">${r.t}</button>`).join('')}
    </div>
    <div data-panel="jroles">${rolePanel(p.roles[0])}</div>`;
  return `
    <div class="demo-head"><p class="mini">The service map</p><button type="button" class="ghost" data-trace>Trace a request</button></div>
    <div class="svc">${p.services.map((s, i) => `<button type="button" data-svc="${i}" class="${i === 0 ? 'gw' : ''}"><b>${s.t}</b><span>:${s.p}</span></button>`).join('')}</div>
    <p class="demo-text" data-panel="svc">Tap a service to see what it does, or trace what happens when you hit <b>Generate</b>.</p>`;
}

const rolePanel = (r) => `<p class="demo-text">${r.d}</p><div class="chips">${chips(r.pages, 'chip dim')}</div>`;

function experience() {
  return `
  <section class="pg-hero reveal">
    ${kicker('03', 'Experience')}
    <h1 class="pg-title">Where I've been learning, building and growing.</h1>
    <p class="pg-lead">Tap any chapter to open it up.</p>
  </section>
  <section class="timeline reveal">
    <span class="tl-line"><span></span></span>
    ${EXPERIENCE.map((e, i) => `
      <article class="tl${i === 0 ? ' open' : ''}">
        <span class="tl-dot" aria-hidden="true"></span>
        <button type="button" class="tl-head" aria-expanded="${i === 0}">
          <span class="tl-when">${e.when} <em>${e.where}</em></span>
          <span class="tl-role">${e.role}</span>
          <span class="tl-org">${e.org}</span>
          <span class="tl-sum">${e.summary}</span>
          <span class="tl-plus" aria-hidden="true"></span>
        </button>
        <div class="tl-body"><div>
          <ul>${e.points.map((p) => `<li>${p}</li>`).join('')}</ul>
          <div class="chips">${chips(e.tags, 'chip dim')}</div>
          ${e.link ? `<div class="link-row">${ext(e.link, 'See Acadex')}</div>` : ''}
        </div></div>
      </article>`).join('')}
  </section>
  ${contactBlock()}`;
}

function blogs() {
  const card = (b) => `
    <article class="post spot${b.demo ? ' feature' : ''}" data-tag="${b.tag}">
      <div class="post-main">
        <p class="post-meta"><span class="chip dim">${b.tag}</span>${b.sub}</p>
        <h3>${b.title}</h3>
        <p class="post-story">&ldquo;${b.story}&rdquo;</p>
        <p>${b.body}</p>
        ${b.facts ? `<div class="proj-stats">${b.facts.map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('')}</div>` : ''}
        <div class="link-row">${ext(b.href, b.cta, 'btn primary')}</div>
      </div>
      ${b.demo ? loopDemo() : ''}
    </article>`;
  return `
  <section class="pg-hero reveal">
    ${kicker('04', 'Blogs')}
    <h1 class="pg-title">I love writing, almost as much as building.</h1>
    <p class="pg-lead">I write about AI and the startups I find exciting. For the startup pieces I usually use the product first, and then sit down with the founders to hear the story behind it.</p>
  </section>
  <section class="block reveal">
    <div class="filters" data-group="posts">
      <button type="button" class="on" data-post="all">All</button>
      <button type="button" data-post="AI">AI</button>
      <button type="button" data-post="Startups">Startups</button>
    </div>
    <div class="posts">${BLOGS.map(card).join('')}</div>
  </section>
  <section class="block reveal">
    <div class="notes">
      <div class="card spot"><i>01</i><h4>I talk to founders</h4><p>My startup writing starts with real conversations. Meeting the people behind a product is the fastest way to understand why it exists.</p></div>
      <div class="card spot"><i>02</i><h4>I write at work too</h4><p>At Acadex I lead writing: blogs, technical policies, product docs and every markdown file in between.</p></div>
      <div class="card spot"><i>03</i><h4>Building and writing, together</h4><p>Writing makes me a clearer engineer, and building gives me something honest to write about.</p></div>
    </div>
  </section>
  ${contactBlock()}`;
}

function loopDemo() {
  return `
    <div class="loop">
      <div class="seg small" role="tablist" data-group="llm">
        <button type="button" role="tab" aria-selected="true" data-llm="raw">Raw LLM</button>
        <button type="button" role="tab" aria-selected="false" data-llm="agent">AI Agent</button>
      </div>
      <div class="loop-body" data-panel="llm">${llmPanel('raw')}</div>
    </div>`;
}

const LOOP = [
  ['Receive', 'Your question and the system instructions are put together into a prompt.'],
  ['Reason', 'The model thinks. It may answer, or say "let me check something first".'],
  ['Act', 'If it asks for a tool, like search or running code, the harness actually runs it.'],
  ['Observe', 'The result gets added back into the conversation as new context.'],
  ['Repeat', 'Back to reasoning with more to work with, until the task is really done.'],
];
function llmPanel(mode) {
  if (mode === 'raw') return `
    <p class="mini">The engine on a crate</p>
    <ul class="caps">
      <li class="no">Remembers you between chats</li>
      <li class="no">Browses, runs code or opens files</li>
      <li class="no">Reliably does big multiplications</li>
      <li class="yes">Predicts the next token, brilliantly</li>
    </ul>
    <p class="demo-text">Text in, text out, then it forgets everything. Powerful, but it has nowhere to go.</p>`;
  return `
    <p class="mini">Engine + car: the agent loop</p>
    <ol class="ring">${LOOP.map(([t], i) => `<li><button type="button" data-loop="${i}">${t}</button></li>`).join('')}</ol>
    <p class="demo-text" data-panel="loop">${LOOP[0][1]}</p>`;
}

const ICONS = {
  tennis: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6c3.2 3.2 3.2 9.6 0 12.8M18.4 5.6c-3.2 3.2-3.2 9.6 0 12.8"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  mountain: '<path d="M2.5 19.5l6.5-11 4 6.5 2.5-3.5 6 8z"/><path d="M7.2 10.6l1.8 1.4 1.6-1.2"/>',
  film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;

function life() {
  const name = [...'MORYASSHAN'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('');
  return `
  <section class="pg-hero reveal">
    ${kicker('05', 'Life')}
    <h1 class="pg-title">${LIFE.lead}</h1>
  </section>

  <section class="pen reveal">
    <p class="mini">My screen name</p>
    <p class="pen-name" aria-label="Moryasshan">${name}</p>
    <p class="pen-text">${LIFE.pen} I love it when people know me by it.</p>
  </section>

  <section class="about-grid reveal">
    <div class="about-text">${LIFE.intro.map((p) => `<p>${p}</p>`).join('')}
      <div class="chips">${chips(LIFE.writes)}</div>
    </div>
    <aside class="award spot">
      <b>${LIFE.award.n}</b>
      <h3>${LIFE.award.t}</h3>
      <p>${LIFE.award.d}</p>
    </aside>
  </section>

  <section class="block reveal">
    <h2 class="h2">Stories I've written</h2>
    <p class="sub">Tap a story to see what it's about, or read the whole thing.</p>
    <div class="shelf">
      ${LIFE.stories.map((s) => `
        <article class="story spot">
          <p class="post-meta"><span class="chip dim">${s.kind}</span></p>
          <h3>${s.title}</h3>
          <blockquote>&ldquo;${s.quote}&rdquo;<cite>&mdash; ${s.by}</cite></blockquote>
          <button type="button" class="story-toggle" aria-expanded="false">What it's about <span aria-hidden="true"></span></button>
          <div class="story-body"><div>
            <p>${s.body}</p>
            <div class="chips">${chips(s.themes, 'chip dim')}</div>
          </div></div>
          <div class="link-row">${ext(s.href, 'Read the full story (PDF)', 'btn primary')}</div>
        </article>`).join('')}
    </div>
  </section>

  <section class="block reveal">
    <h2 class="h2">When I'm not writing</h2>
    <p class="sub">You'll probably find me on a court, a trail or a train to somewhere new.</p>
    <div class="hobbies">
      ${LIFE.hobbies.map((h) => `
        <div class="card hobby spot${h.times ? ' wide' : ''}">
          <span class="hobby-icon">${icon(h.icon)}</span>
          <h4>${h.t}</h4>
          <p>${h.d}</p>
          ${h.times ? `
            <p class="mini ask">When do I play?</p>
            <div class="filters" data-group="tennis">${h.times.map(([t], i) => `<button type="button" data-tennis="${i}">${t}</button>`).join('')}</div>
            <p class="demo-text tennis-answer" data-panel="tennis">Pick a time.</p>` : ''}
        </div>`).join('')}
    </div>
  </section>

  <section class="block reveal">
    <p class="closing">${LIFE.close}</p>
  </section>
  ${contactBlock()}`;
}

const RENDER = { about, projects, experience, blogs, life };

/* ---------- interactions ---------- */

function select(group, btn) {
  group.querySelectorAll('[role="tab"]').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
}

// swap a panel's contents with a short fade
function swap(el, html) {
  if (!el) return;
  el.classList.add('swapping');
  setTimeout(() => { el.innerHTML = html; el.classList.remove('swapping'); }, reduce ? 0 : 160);
}

let stepTimer = null, pipeTimer = null, traceTimer = null;

function setStep(i) {
  const steps = body.querySelector('.steps');
  if (!steps) return;
  const btns = [...steps.querySelectorAll('[data-step]')];
  btns.forEach((b, j) => { b.setAttribute('aria-selected', String(j === i)); b.classList.toggle('done', j < i); });
  steps.querySelector('.steps-bar span').style.width = `${(i / (btns.length - 1)) * 100}%`;
  swap(body.querySelector('[data-panel="steps"]'), ACADEX.steps[i].d);
}
function playJourney(btn) {
  clearInterval(stepTimer);
  let i = 0; setStep(0);
  btn.textContent = 'Playing…';
  stepTimer = every(() => {
    i++;
    if (i >= ACADEX.steps.length) { clearInterval(stepTimer); btn.textContent = 'Replay'; return; }
    setStep(i);
  }, 1800);
}

function setPipe(i, text) {
  const nodes = [...body.querySelectorAll('[data-pipe]')];
  nodes.forEach((n, j) => { n.classList.toggle('on', j === i); n.classList.toggle('past', j < i); });
  const s = PROJECTS[0].pipeline[i];
  swap(body.querySelector('[data-panel="pipe"]'), text || `<b>${s.t}.</b> ${s.d}`);
}
function playPipe() {
  clearInterval(pipeTimer);
  let i = 0; setPipe(0);
  pipeTimer = every(() => {
    i++;
    if (i >= PROJECTS[0].pipeline.length) { clearInterval(pipeTimer); swap(body.querySelector('[data-panel="pipe"]'), 'That whole trip takes <b>under 400ms</b>. Now try <b>Interrupt</b>.'); return; }
    setPipe(i);
  }, 1100);
}
function cutPipe() {
  clearInterval(pipeTimer);
  const nodes = [...body.querySelectorAll('[data-pipe]')];
  nodes.forEach((n) => n.classList.remove('on', 'past'));
  nodes[4].classList.add('cut');
  later(() => { nodes[4].classList.remove('cut'); setPipe(1, '<b>Barge-in.</b> You started talking, so Silero VAD caught it and the agent stopped speaking right away. Now it is listening again.'); }, 500);
}

function setSvc(i, text) {
  const s = PROJECTS[2].services[i];
  body.querySelectorAll('[data-svc]').forEach((b, j) => b.classList.toggle('on', j === i));
  swap(body.querySelector('[data-panel="svc"]'), text || `<b>${s.t}-service :${s.p}</b>. ${s.d}`);
}
const TRACE = [
  [0, 'You hit <b>Generate</b>. The gateway tags the request with an ID and forwards it.'],
  [5, 'The <b>email</b> service picks it up.'],
  [3, '<b>usage</b> reserves one credit, just in case.'],
  [4, '<b>ai</b> writes the email with Groq.'],
  [5, '<b>email</b> saves the draft to your history.'],
  [3, '<b>usage</b> commits the credit. If anything failed, it would have been released instead.'],
];
function trace(btn) {
  clearInterval(traceTimer);
  let i = 0; setSvc(...TRACE[0]);
  btn.textContent = 'Tracing…';
  traceTimer = every(() => {
    i++;
    if (i >= TRACE.length) { clearInterval(traceTimer); btn.textContent = 'Trace again'; return; }
    setSvc(...TRACE[i]);
  }, 1500);
}

page.addEventListener('click', (e) => {
  const t = e.target.closest('button, a');
  if (!t || !page.contains(t)) return;
  const d = t.dataset;

  if ('home' in d) { e.preventDefault(); closePage(); return; }
  if (d.page) { e.preventDefault(); showPage(d.page, { push: false }); return; }
  if (d.copy) {
    navigator.clipboard?.writeText(d.copy).then(() => {
      t.textContent = 'Copied!';
      later(() => { t.textContent = 'Copy my email'; }, 1600);
    }, () => { location.href = `mailto:${d.copy}`; });
    return;
  }
  if (d.mode) { select(t.parentElement, t); swap(body.querySelector('[data-panel="modes"]'), modePanel(d.mode)); return; }
  if (d.skill) {
    t.parentElement.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === t));
    body.querySelectorAll('.pill').forEach((p) => p.classList.toggle('dimmed', d.skill !== 'all' && p.dataset.cat !== d.skill));
    return;
  }
  if (d.arole) { select(t.parentElement, t); swap(body.querySelector('[data-panel="acadex-roles"]'), ACADEX.roles.find((r) => r.key === d.arole).text); return; }
  if (d.step) { clearInterval(stepTimer); body.querySelector('[data-journey-play]').textContent = 'Play'; setStep(+d.step); return; }
  if ('journeyPlay' in d) { playJourney(t); return; }
  if (d.proj) {
    select(t.parentElement, t);
    clearInterval(pipeTimer); clearInterval(traceTimer);
    swap(body.querySelector('[data-panel="proj"]'), projectPanel(d.proj));
    return;
  }
  if (d.pipe) { clearInterval(pipeTimer); setPipe(+d.pipe); return; }
  if ('pipePlay' in d) { playPipe(); return; }
  if ('pipeCut' in d) { cutPipe(); return; }
  if (d.jrole) { select(t.parentElement, t); swap(body.querySelector('[data-panel="jroles"]'), rolePanel(PROJECTS[1].roles[+d.jrole])); return; }
  if (d.svc) { clearInterval(traceTimer); body.querySelector('[data-trace]').textContent = 'Trace a request'; setSvc(+d.svc); return; }
  if ('trace' in d) { trace(t); return; }
  if (d.llm) { select(t.parentElement, t); swap(body.querySelector('[data-panel="llm"]'), llmPanel(d.llm)); return; }
  if (d.loop) {
    body.querySelectorAll('[data-loop]').forEach((b, j) => b.classList.toggle('on', j === +d.loop));
    swap(body.querySelector('[data-panel="loop"]'), LOOP[+d.loop][1]);
    return;
  }
  if (d.post) {
    t.parentElement.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === t));
    body.querySelectorAll('.post').forEach((p) => { p.hidden = d.post !== 'all' && p.dataset.tag !== d.post; });
    return;
  }
  if (d.tennis) {
    t.parentElement.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === t));
    const ans = LIFE.hobbies[0].times[+d.tennis][1];
    swap(body.querySelector('[data-panel="tennis"]'), `<b>${ans.split('.')[0]}.</b>${ans.slice(ans.indexOf('.') + 1)}`);
    return;
  }
  if (t.classList.contains('story-toggle')) {
    const s = t.closest('.story'), open = !s.classList.contains('open');
    s.classList.toggle('open', open);
    t.setAttribute('aria-expanded', String(open));
    return;
  }
  if (t.classList.contains('tl-head')) {
    const item = t.parentElement, open = !item.classList.contains('open');
    item.classList.toggle('open', open);
    t.setAttribute('aria-expanded', String(open));
  }
});

// soft light that follows the cursor across cards
scroller.addEventListener('pointermove', (e) => {
  const el = e.target.closest('.spot');
  if (!el) return;
  const r = el.getBoundingClientRect(), k = r.width / el.offsetWidth || 1;   // k undoes the big-screen zoom
  el.style.setProperty('--mx', `${(e.clientX - r.left) / k}px`);
  el.style.setProperty('--my', `${(e.clientY - r.top) / k}px`);
});

// timeline line fills as you scroll past it
scroller.addEventListener('scroll', () => {
  const tl = body.querySelector('.timeline');
  if (!tl) return;
  const r = tl.getBoundingClientRect();
  const k = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
  tl.querySelector('.tl-line span').style.height = `${k * 100}%`;
}, { passive: true });

function countUp(el) {
  const n = +el.dataset.count, suf = el.dataset.suffix, t0 = performance.now(), dur = reduce ? 0 : 1400;
  (function tick(now) {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1;
    el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))) + suf;
    if (k < 1) requestAnimationFrame(tick);
  })(t0);
}

const seen = new IntersectionObserver((entries) => {
  for (const en of entries) {
    if (!en.isIntersecting) continue;
    en.target.classList.add('seen');
    en.target.querySelectorAll('[data-count]').forEach(countUp);
    seen.unobserve(en.target);
  }
}, { root: scroller, threshold: 0, rootMargin: '0px 0px -12% 0px' });   // tall blocks never reach a % threshold on phones

function mount(name) {
  clearTimers();
  current = name;
  body.innerHTML = RENDER[name]();
  scroller.scrollTop = 0;
  page.querySelectorAll('.page-nav a').forEach((a) => a.classList.toggle('on', a.dataset.page === name));
  document.title = `Shaan | ${name[0].toUpperCase()}${name.slice(1)}`;
  if (name === 'about') body.querySelector('[data-panel="modes"]').innerHTML = modePanel(ABOUT.modes[0].key);
  if (name === 'projects') body.querySelector('[data-panel="proj"]').innerHTML = projectPanel(PROJECTS[0].key);
  body.querySelectorAll('.reveal').forEach((el) => seen.observe(el));
}

/* ---------- open / switch / close ---------- */

export const hasPage = (name) => Object.hasOwn(RENDER, name);

let closing = null;   // the running close animation, so a quick re-open can cancel it

export function showPage(name, { x, y, push = true } = {}) {
  if (!RENDER[name]) return;
  const reopening = !!closing;
  if (reopening) { closing.cancel(); closing = null; }
  if (!page.hidden && !reopening) {
    if (name === current) return;
    history.replaceState({ page: name }, '', `#${name}`);
    body.classList.add('leaving');
    later(() => { mount(name); body.classList.remove('leaving'); }, reduce ? 0 : 220);
    return;
  }
  if (push) history.pushState({ page: name }, '', `#${name}`);
  origin = { x: x ?? innerWidth / 2, y: y ?? innerHeight / 2 };
  page.hidden = false;
  mount(name);   // after unhiding, so the scroll reset actually applies
  document.body.classList.add('paged');
  const r = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
  const anim = page.animate(
    [{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }, { clipPath: `circle(${r}px at ${origin.x}px ${origin.y}px)` }],
    { duration: reduce ? 1 : 900, easing: 'cubic-bezier(.65, 0, .35, 1)' },
  );
  anim.finished.then(() => page.classList.add('in'));
}

// fromHistory: the browser already moved back, so don't step back again
export function closePage(fromHistory = false) {
  if (page.hidden || closing) return;
  if (!fromHistory && history.state?.page) { history.back(); return; }
  if (!fromHistory) history.replaceState(null, '', location.pathname);
  clearTimers();
  body.classList.remove('leaving');
  const { x, y } = origin;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const anim = closing = page.animate(
    [{ clipPath: `circle(${r}px at ${x}px ${y}px)` }, { clipPath: `circle(0px at ${x}px ${y}px)` }],
    { duration: reduce ? 1 : 700, easing: 'cubic-bezier(.65, 0, .35, 1)' },
  );
  anim.finished.then(() => {
    closing = null;
    page.hidden = true;
    page.classList.remove('in');
    document.body.classList.remove('paged');
    document.title = 'Shaan | Vegas After Dark';
    current = null;
  }, () => {});   // cancelled by a re-open: stay open
}

window.addEventListener('popstate', (e) => {
  const name = e.state?.page;
  if (name) showPage(name, { push: false });
  else closePage(true);
});

window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !page.hidden) closePage(); });

// nav links on the landing page open their page out of the link itself
document.querySelectorAll('#home [data-page]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const r = a.getBoundingClientRect();
    showPage(a.dataset.page, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  });
});
