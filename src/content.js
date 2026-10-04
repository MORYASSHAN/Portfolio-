// Everything the inner pages say lives here, so the words can change without touching layout code.

export const CONTACT = {
  email: 'shaangoswami1078@gmail.com',
  linkedin: 'https://www.linkedin.com/in/shaan-goswami-778729274/',
  x: 'https://x.com/Shaanjson',
  cal: 'https://cal.com/moryasshan',
  github: 'https://github.com/MORYASSHAN',
};

export const ABOUT = {
  lead: "I'm a developer first. A writer and storyteller too.",
  aka: "That's my screen name, and I love it when people know me by it. It's on my GitHub, my scripts and my stories.",
  intro: [
    "I'm Shaan Goswami, a Computer Science undergrad at IIIT Bhubaneswar and a Full Stack Engineer at Ereefian, where I help build <b>Acadex</b>, an academic platform we shaped by first talking to 500+ students and 30+ professors.",
    "I've spent the last two years shipping real web apps on the MERN stack. I like the whole journey: a messy idea, a clean system design, the late-night debugging, and the moment it goes live and somebody uses it.",
    "Code is what I do most. On top of that I'm a writer and a storyteller: I love breaking down how startups think, I often end up talking to the founders themselves, and I write real stories and scripts too.",
  ],
  stats: [
    { n: 2, suffix: '+', label: 'years shipping production web apps' },
    { n: 500, suffix: '+', label: 'students surveyed before we built Acadex' },
    { n: 30, suffix: '+', label: 'professors surveyed to shape it' },
    { n: 40, suffix: '%', label: 'faster feature releases from a modular architecture' },
  ],
  modes: [
    {
      key: 'build', label: 'Builder',
      title: 'I like owning a feature from idea to deploy.',
      body: 'Frontend, backend, database, auth, deployment. I would rather understand the whole system than one corner of it. My favourite problems are the ones where good architecture quietly saves the team weeks later.',
      points: ['MERN end to end', 'REST API & schema design', 'RBAC & system design', 'Real-time voice AI agents'],
    },
    {
      key: 'write', label: 'Writer',
      title: 'Writing is how I make sure I really understand something.',
      body: "At Acadex I lead writing: blogs, technical policies, product docs and the markdown files that keep a codebase readable. Outside work I write about AI and startups, and I've sat down with founders to get their stories right.",
      points: ['Technical writing', 'Startup & category stories', 'Docs, policies, READMEs', 'Founder conversations'],
    },
    {
      key: 'story', label: 'Storyteller',
      title: 'Stories are how I understand people.',
      body: "I write real stories, plays and screenplays, and I've won Best Script Writer twice at college events. I love the process of expressing yourself through a story, and I bring that same instinct to products and startups: every good one is a story about someone's problem.",
      points: ['Screenplays & plays', 'Real-life stories', 'Best Script Writer ×2', 'Filmmaking'],
    },
    {
      key: 'grow', label: 'Growth',
      title: 'A great product still needs people to find it.',
      body: 'I spent two months as a growth fellow at Frizzel (YC S25), and I care about how a product reaches its users. That means research, go-to-market thinking, and choosing what to build next and why.',
      points: ['Go-to-market', 'Roadmapping & prioritisation', 'User & market research', 'Growth fellowship at Frizzel (YC S25)'],
    },
  ],
  skills: [
    { cat: 'Languages', items: ['C++', 'JavaScript', 'HTML5', 'CSS3'] },
    { cat: 'Frontend', items: ['React.js', 'Redux', 'Responsive Web Design', 'Figma'] },
    { cat: 'Backend', items: ['Node.js', 'Express.js', 'API Design', 'Authentication & Authorization'] },
    { cat: 'Databases', items: ['MongoDB', 'Firebase', 'Schema Design', 'Query Optimization'] },
    { cat: 'Tools', items: ['Git', 'GitHub', 'Vercel', 'Postman'] },
    { cat: 'Core', items: ['Data Structures & Algorithms', 'System Design', 'RBAC', 'Microservices'] },
    { cat: 'AI', items: ['AI Agents', 'API Integration', 'Prompt Engineering'] },
    { cat: 'Growth', items: ['Go-To-Market', 'Roadmapping & Prioritization', 'User & Market Research'] },
  ],
};

export const ACADEX = {
  url: 'https://acadex.ereefian.com',
  tagline: 'One home for everything academic.',
  body: [
    'Acadex is an academic management platform built to simplify and centralise everyday college life for students, teachers and administrators. Instead of juggling a dozen tools, spreadsheets and notice boards, everything academic lives in one organised system. Before we built anything, we surveyed 500+ students and 30+ professors, and Acadex was designed around what they told us.',
    "As a Full Stack Engineer I worked across the whole product, frontend and backend. I turned product requirements into working interfaces and backend systems, built and integrated APIs, shaped and optimised the database, and handled authentication and role-based access across the app. I care a lot about the product feeling responsive and reliable, so I also spent real time on testing, debugging, deployment and small improvements.",
  ],
  roles: [
    { key: 'students', label: 'Students', text: 'Timetables, attendance, exams and academic updates in one place, so nothing gets lost in a group chat.' },
    { key: 'teachers', label: 'Teachers', text: 'Less admin busywork. Schedules, attendance and exams are handled in the same system their students already use.' },
    { key: 'admins', label: 'Admins', text: 'Enrollment, faculty, timetables and subscriptions, protected by role-based access so everyone sees exactly what they should.' },
  ],
  steps: [
    { t: 'Research', d: 'Before writing any code we surveyed 500+ students and 30+ professors to learn what they actually struggle with, then turned their answers into clear feature requirements.' },
    { t: 'Design', d: 'Design complete features and the frontend UI/UX from the ground up. Flows first, then screens.' },
    { t: 'Build', d: 'React & Redux on the front, Node & Express on the back, MongoDB underneath. APIs designed and wired end to end.' },
    { t: 'Integrate', d: 'Connect every piece, add authentication and role-based access, and make sure every role sees the right thing.' },
    { t: 'Test', d: 'Break it on purpose. Debug, fix and retest until it feels solid for every role.' },
    { t: 'Ship', d: 'Deploy, watch how people really use it, and keep improving it with the team.' },
  ],
  owned: [
    { t: 'Role-based access control', d: 'Designed the RBAC system so students, teachers and admins each get their own permissions from one codebase.' },
    { t: 'Events & notifications', d: 'Owned the system design for event management and the notification infrastructure.' },
    { t: 'Modular architecture', d: 'Built features to be extensible, which cut release cycles by 40%.' },
    { t: 'API & schema tuning', d: 'Reworked REST queries and MongoDB schemas, cutting average API response time by 35%.' },
  ],
  writing: {
    title: 'I also lead writing at Acadex.',
    body: 'Every blog, technical policy, product document and markdown file behind Acadex was written by me. Writing for a product taught me something engineering alone did not: if a policy or a doc is confusing, the feature behind it is too.',
    items: ['Tech blogs', 'Technical policies', 'Product documents', 'Markdown & READMEs'],
  },
  stack: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Redux', 'REST APIs', 'RBAC', 'System Design'],
};

export const PROJECTS = [
  {
    key: 'voiceforge',
    name: 'VoiceForge',
    kind: 'Open-source voice AI',
    repo: 'https://github.com/MORYASSHAN/voiceforge',
    tagline: 'Talk to an AI agent that talks back in real time, and lets you interrupt it.',
    body: [
      "VoiceForge is an open-source starter kit for building real-time voice agents. You speak, it listens, thinks and answers out loud in under 400ms. And like a real conversation, if you cut in, it stops talking and listens.",
      "I built it so anyone can go from <code>git clone</code> to a live voice agent in their browser in about five minutes. A setup wizard checks your keys and writes the config for you, you bring your own API keys so nothing is proxied, and you can switch personas like Study Buddy, Meeting Notes or Voice Journal with a simple YAML file.",
    ],
    stats: [['<400ms', 'end-to-end response'], ['27', 'passing tests'], ['4', 'live visualizers'], ['MIT', 'open source']],
    demo: 'pipeline',
    pipeline: [
      { t: 'You speak', d: 'Audio streams from the browser over LiveKit in real time.' },
      { t: 'Silero VAD', d: 'Voice activity detection notices when you start and stop talking. This is what makes barge-in work.' },
      { t: 'Whisper', d: "Groq's whisper-large-v3-turbo turns your voice into text almost instantly." },
      { t: 'Llama 3.3', d: 'llama-3.3-70b-versatile does the thinking, guided by the persona you chose.' },
      { t: 'Orpheus TTS', d: 'The reply becomes natural, expressive speech.' },
      { t: 'You hear it', d: 'Streamed back while the React UI shows transcripts, latency and token usage live.' },
    ],
    extras: ['Keyboard-first UI (Space to mute, Esc to interrupt)', 'Orb, Spectrum, Aura & Constellation visualizers', 'Self-hostable with Docker Compose', 'FastAPI token server with health & diagnostics'],
    stack: ['Python', 'LiveKit Agents', 'Groq', 'FastAPI', 'React 18', 'TypeScript', 'Vite', 'Tailwind', 'Docker', 'Pytest'],
  },
  {
    key: 'juteit',
    name: 'JuteIt',
    kind: 'E-commerce platform',
    repo: 'https://github.com/MORYASSHAN/juteit',
    live: 'https://juteit.vercel.app',
    tagline: 'A store for eco-friendly jute products, with a 3D storefront and a full owner dashboard.',
    body: [
      "JuteIt is a complete online store for eco-friendly jute products. On the outside it's a calm shopping experience with a 3D jute scene built in React Three Fiber. On the inside it's a real business tool: products, orders, banners, inquiries and settings are all managed from an owner dashboard.",
      'I built it as a monorepo with a React + TypeScript frontend and an Express + MongoDB backend. Images go through Cloudinary, emails through Nodemailer, and access is split into three roles with JWT auth. I also wrote the buyer, owner and admin guides and the API reference, so whoever runs the store never has to guess.',
    ],
    stats: [['3', 'user roles'], ['7', 'REST resources'], ['3D', 'storefront scene'], ['Live', 'on Vercel']],
    demo: 'roles',
    roles: [
      { t: 'Buyer', d: 'Browse products, open details, add to cart, check out, and track orders from a personal profile.', pages: ['Home', 'Product', 'Cart', 'Checkout', 'Orders', 'Profile'] },
      { t: 'Owner', d: 'Run the store: manage products and orders, change homepage banners, answer inquiries, tune settings.', pages: ['Dashboard', 'Products', 'Orders', 'Banners', 'Inquiries', 'Settings'] },
      { t: 'Master', d: 'The root admin (me). Protected by a master key: assign or revoke owners, maintain the database, handle deployment.', pages: ['Assign owners', 'Revoke roles', 'DB maintenance', 'Deploys'] },
    ],
    extras: ['React Three Fiber 3D jute scene', 'Cloudinary image uploads', 'Email via Nodemailer', 'Buyer, owner & master docs + API reference'],
    stack: ['React 19', 'TypeScript', 'Vite', 'Tailwind', 'Three.js / R3F', 'TanStack Query', 'Express 5', 'MongoDB', 'JWT', 'Cloudinary', 'Vercel'],
  },
  {
    key: 'meakly',
    name: 'Meakly',
    kind: 'AI SaaS · microservices',
    repo: 'https://github.com/MORYASSHAN/meakly',
    tagline: 'An AI outreach workbench that writes cold emails worth replying to.',
    body: [
      "Meakly helps you write precise cold emails with AI. Generate a first draft, rewrite it, spin up a follow-up, save the ones you like, and keep an eye on your monthly usage, all in one dark, focused workspace.",
      'I designed it backend-first as eight independent microservices behind an API gateway, so each part can be deployed and scaled on its own. It has real signup, email verification and password reset, Stripe billing that syncs plans across services, and a quota system that reserves usage before a generation and only commits it if the email is saved.',
    ],
    stats: [['8', 'microservices'], ['1', 'API gateway'], ['Stripe', 'billing & plans'], ['/metrics', 'on every service']],
    demo: 'services',
    services: [
      { t: 'gateway', p: 5000, d: 'The front door. Adds request IDs, proxies to services and reports the health of the whole system.' },
      { t: 'auth', p: 5001, d: 'Signup, login, refresh tokens, logout, email verification and password reset.' },
      { t: 'user', p: 5002, d: 'Profiles and a snapshot of each subscription.' },
      { t: 'usage', p: 5003, d: 'Monthly quotas with reserve, commit and release, so failed generations never cost you.' },
      { t: 'ai', p: 5004, d: 'Generates, rewrites and writes follow-ups using Groq.' },
      { t: 'email', p: 5005, d: 'Generate, save, list, favourite and delete emails.' },
      { t: 'billing', p: 5006, d: 'Stripe checkout, customer portal and webhooks that sync plans everywhere.' },
      { t: 'notify', p: 5007, d: 'Sends verification and password reset emails.' },
    ],
    extras: ['Request IDs traced across every hop', 'Health + latency on every downstream call', 'Internal routes locked with a service token', 'Bug reporting built into the product'],
    stack: ['Node.js', 'Express', 'MongoDB Atlas', 'Groq', 'Stripe', 'JWT', 'React', 'Tailwind 4', 'Framer Motion', 'GSAP', 'Zustand'],
  },
];

export const EXPERIENCE = [
  {
    when: '2024 — Present', where: 'Remote',
    role: 'Full Stack Engineer & Writing Head', org: 'Ereefian · Acadex', link: 'https://acadex.ereefian.com',
    summary: 'Building Acadex end to end, and writing everything that explains it.',
    points: [
      'Surveyed 500+ students and 30+ professors before building, and designed Acadex around what they told us.',
      'Developed and shipped full-stack features end to end on the MERN stack.',
      'Designed complete product features and the frontend UI/UX from the ground up, turning business requirements into responsive interfaces.',
      'Owned system design for role-based access control, event management and notification infrastructure, cutting feature release cycles by 40%.',
      'Optimised REST API queries and MongoDB schema design, reducing average API response time by 35%.',
      'Led writing: every tech blog, technical policy, product document and markdown file.',
    ],
    tags: ['MERN', 'RBAC', 'System Design', 'Technical Writing'],
  },
  {
    when: '2 months', where: 'Remote',
    role: 'Growth Fellow', org: 'Frizzel (YC S25)',
    summary: 'A growth fellowship inside a Y Combinator startup, learning how early products find their users.',
    points: [
      'Worked on the growth side of a YC S25 company during a two-month remote fellowship.',
      'Got up close with go-to-market thinking, research and prioritisation at startup speed.',
      'Brought that lens back to engineering: build what moves the product, not just what is fun to build.',
    ],
    tags: ['Growth', 'GTM', 'Startups'],
  },
  {
    when: 'Selected', where: 'Program',
    role: 'Selected Participant', org: 'McKinsey Forward Learning Program',
    summary: 'Selected for the McKinsey Forward Learning Program.',
    points: [
      'Chosen for the program, which focuses on problem solving, communication and the skills needed to grow in a modern workplace.',
    ],
    tags: ['Problem Solving', 'Leadership'],
  },
  {
    when: '2024 — 2028', where: 'Bhubaneswar',
    role: 'B.Tech, Computer Science & Engineering', org: 'International Institute of Information Technology, Bhubaneswar',
    summary: 'Where the fundamentals come from: data structures, algorithms and a lot of C++.',
    points: [
      'Studying Computer Science & Engineering while building and shipping production software in parallel.',
      'Strong focus on Data Structures & Algorithms and System Design.',
    ],
    tags: ['CSE', 'DSA', 'C++'],
  },
];

export const LIFE = {
  lead: "Off the keyboard, I'm a storyteller.",
  pen: 'I write as Moryasshan. It started as a screen name and became the name on every script and story I sign.',
  intro: [
    "I write real stories, plays, screenplays and a lot in between. What I love is the process itself: taking something you feel and finding a way to say it so someone else feels it too.",
    "Most of all, I love understanding people and the way they see the world. That curiosity is why I write about products and startups the way I do. Behind every one of them is a person with a story worth telling properly.",
  ],
  award: { n: '2×', t: 'Best Script Writer', d: 'Won twice at my college events. Both times it was for writing something that made a room go quiet for a moment.' },
  writes: ['Real stories', 'Plays', 'Screenplays', 'Short stories', 'Films', 'Product & startup stories'],
  stories: [
    {
      key: 'mind',
      title: 'Mind',
      kind: 'Original screenplay · 15 pages',
      href: '/stories/mind.pdf',
      quote: 'Once in life, the moments we want more, and the things we pray for... to get them, it will make you cry.',
      by: 'Moryasshan',
      body: 'A girl named X carries a heartbreak she cannot shake, so she asks Morya to help her heal. His answer is to take her inside her own mind. There, overthinking takes the shape of a crowd of strangers closing in, and an apple on the table is the only way to tell what is real, because in the mind you can never eat it.',
      themes: ['Healing', 'Overthinking', 'Trust', 'The subconscious'],
    },
    {
      key: 'slum',
      title: 'Slum Line Escaper',
      kind: 'Short story',
      href: '/stories/slum-line-escaper.pdf',
      quote: 'Sometimes, to become something, a dream is needed more than money.',
      by: 'Moryasshan',
      body: "At a fashion seminar a boy asks whether design is only for people with money. The speaker answers with a story about Sita, a 17-year-old from Dharavi who turns her mehendi art into clothing designs. She learns to sew from YouTube on her grandmother's old machine and keeps going through loss and rejection, all the way to the ramp. The last line reveals who she really is.",
      themes: ['Dreams', 'Struggle', 'Indian heritage', 'Family'],
    },
  ],
  hobbies: [
    {
      key: 'tennis', icon: 'tennis', t: 'Tennis',
      d: "I'm a tennis player, and honestly I'll play whenever there's a court free.",
      times: [
        ['Morning', 'Yes. The best way to start a day.'],
        ['Afternoon', 'Yes. Sun, sweat and no excuses.'],
        ['Evening', 'Yes. My favourite way to switch off after work.'],
        ['Anytime', 'Always yes. Just tell me where the court is.'],
      ],
    },
    { key: 'travel', icon: 'compass', t: 'Solo traveller', d: 'I travel alone on purpose. New places and strangers teach me things no plan could, and every trip ends up as a story.' },
    { key: 'mountain', icon: 'mountain', t: 'Aspiring mountaineer', d: 'Mountains are my favourite kind of hard problem. Slow, honest and humbling, and the view is always worth it.' },
    { key: 'film', icon: 'film', t: 'Filmmaker', d: 'Writing a scene is one thing. Seeing it come alive with a camera, light and sound is where the story finally breathes.' },
  ],
  close: "Code, words, films or a long walk up a mountain: it's all the same thing to me. I'm trying to understand people, and tell their story well.",
};

export const BLOGS = [
  {
    key: 'agents',
    tag: 'AI',
    title: 'How my curiosity grew my knowledge of making AI agents',
    sub: 'What an AI agent really is, seen from the field',
    page: 'agents',
    cta: 'Read the post',
    story: 'Every agent demo felt like a trick. Then someone sketched a few boxes on a whiteboard.',
    body: "An AI agent is not one magic thing. It's a plain application wrapped around a language model, plus a few well-defined pieces that let it read, decide and act. This is the map I wish I'd had: structured output, system prompts, tools and MCP, RAG and the knobs that fix it, and one request traced end to end.",
    facts: [['5', 'boxes to draw'], ['7', 'RAG knobs'], ['1', 'agent loop'], ['0', 'magic']],
  },
  {
    key: 'llm',
    tag: 'AI',
    title: 'Understanding Raw LLMs vs AI Agents',
    sub: "A forward-deployed engineer's view",
    href: '/blogs/raw-llms-vs-ai-agents.pdf',
    cta: 'Read the article (PDF)',
    story: 'A friend told me raw LLMs always give the right answer and remember everything. I disagreed, and this post is my long answer.',
    body: "A plain LLM is a prediction engine: stateless, limited by its context window, and unable to act on the world. Products like ChatGPT and Claude Code feel smarter because they wrap that engine in a harness with memory, tools and a control loop. In the post I explain the difference with a simple analogy: the model is the engine, and the product is the whole car.",
    demo: 'loop',
  },
  {
    key: 'amboras',
    tag: 'Startups',
    title: 'Shaan × Amboras: Five Stories for Agentic Commerce',
    sub: 'An editorial pitch, written before asking for anything',
    href: 'https://shaan-amboras.ploy.build/abm/amboras',
    cta: 'Read the essays',
    story: "I didn't send a résumé. I wrote the category story.",
    body: 'I used Amboras, studied how they explain AI-native commerce, and wrote a full editorial package around the category they are building. It includes five edited essays, five social posts and a letter to the founders. The core idea: AI can make words, but stories make people stay. In a world where anyone can launch a store fast, the edge is a store that keeps learning after launch.',
    facts: [['5', 'edited essays'], ['5', 'social posts'], ['1', 'founder letter'], ['0', 'generic applications']],
  },
  {
    key: 'bullet',
    tag: 'Startups',
    title: 'Writing about Bullet',
    sub: 'A startup growth story, shared on LinkedIn',
    href: 'https://lnkd.in/p/ei5XyfMa',
    cta: 'Read on LinkedIn',
    story: 'I love digging into how young startups grow.',
    body: 'A breakdown of Bullet through a startup-growth lens: what they are building, why it matters and what other founders can learn from it. Like most of my startup writing, it started with using the product and talking to the people behind it.',
  },
];

// the full "How my curiosity grew my knowledge" post, read in place on the #agents page
export const AGENT_POST = {
  title: 'How my curiosity grew my knowledge of making AI agents',
  lead: "An AI agent is not one magic thing. It's a plain application wrapped around a language model, plus a few well-defined pieces that let it read, decide and act. It took me an embarrassingly long time to see that.",
  read: '9 min read',
  arch: [
    { t: 'Client', s: 'chat, Slack, app', d: "Whatever the user touches: a chat window, a Slack bot, a mobile app. It just sends a message and shows the reply. Nothing smart lives here." },
    { t: 'App server', s: 'LLM client + MCP client', d: "The real agent. Ordinary backend code (mine was Java with Spring AI) holding two connections: one to the model, one out to tools. The client only ever talks to this box." },
    { t: 'LLM', s: 'the brain', d: "Reads text and writes text. It doesn't touch your calendar or your database by itself. It can only ask." },
    { t: 'MCP servers', s: 'the hands', d: "Each one wraps a real system, like Google Calendar, a CRM or a file store, and exposes it as a small set of tools the model can ask for." },
    { t: 'Knowledge base', s: 'your documents', d: "Your company's own docs, searched before the model answers. The model knows the internet, not your return policy. This is where RAG lives." },
  ],
  json: {
    ask: {
      label: 'Please return JSON',
      kind: 'An instruction',
      code: 'Sure! Here\'s the JSON you requested:\n{\n  "title": "Docker deployment",\n  "attendee": "Rahul",\n  "date": "tomorrow",\n  "time": "4 PM",\n  "durationMinutes": 30\n}',
      verdict: ['no', 'I could skip that first line. The JSON parser could not.'],
    },
    schema: {
      label: 'Structured output',
      kind: 'A contract',
      code: 'public record MeetingRequest(\n    String title,\n    String attendee,\n    String date,\n    String time,\n    int durationMinutes\n) {}\n\nif (meeting.durationMinutes() &gt; 60) requireApproval();',
      verdict: ['yes', 'The framework makes the model fill fixed slots and maps the result straight into an object. Normal code takes over.'],
    },
  },
  prompt: [
    { t: 'Role', d: "Who the agent is and who it's talking to.", line: 'You are the support assistant for an electronics store. Users are customers, not staff.' },
    { t: 'Rules', d: 'The hard lines: what it must never do, when to say "I don\'t know", when to hand off to a human.', line: 'Never make up a policy. If the answer isn\'t in the documents, say "I don\'t know" and hand off to a human.' },
    { t: 'Tools', d: "When to reach for which tool. The model sees each tool's description, but the system prompt says when to use it.", line: 'Use the order lookup tool only when the customer gives an order number.' },
    { t: 'Context', d: 'How to treat retrieved documents.', line: 'Prefer the most specific policy over the general one. Only answer from the provided documents.' },
    { t: 'Output', d: 'Tone, length, and whether the answer is for a human or for code.', line: 'Keep answers short and friendly. They are read by a customer, not by code.' },
  ],
  rag: {
    question: 'Can I return my damaged headphones after 10 days?',
    policies: { general: ['General returns', '30 days from delivery.'], electronics: ['Electronics returns', '7 days, subject to inspection.'], damaged: ['Damaged products', 'Must be reported within 48 hours.'] },
    basic: { chunks: ['general'], answer: 'Yes, you have 30 days.', ok: false, note: "Wrong twice over. And the model wasn't stupid: it answered correctly from what it was given. A good LLM can't use a policy that never reaches its context." },
    tuned: { chunks: ['damaged', 'electronics', 'general'], answer: "Damaged items have to be reported within 48 hours, and electronics returns close after 7 days, so at 10 days this one isn't eligible.", ok: true, note: 'With better retrieval (chunking, filters, reranking) the specific policies finally reach the model, and the system prompt tells it to prefer the most specific policy over the general one.' },
  },
  hybrid: {
    q: 'Does the AX-204 support fast charging?',
    want: 'AX-204 · Battery and charging',
    notes: {
      vector: 'Embeddings match the <b>meaning</b>, "headphones + fast charging", and put the wrong product first.',
      bm25: 'Keyword search nails the exact code <b>AX-204</b>, but it knows nothing about meaning.',
      rrf: 'Merged by position with k = 60. The right document wins because <b>both</b> lists rank it highly.',
    },
    lists: {
      vector: ['BX-900 · Fast charging guide', 'AX-204 · Battery and charging', 'Wireless headphones · Buying guide', 'AX-204 · Quick start'],
      bm25: ['AX-204 · Battery and charging', 'AX-204 · Quick start', 'BX-900 · Fast charging guide'],
    },
  },
  knobs: [
    { t: 'Better chunking', q: 'Where should documents be split?', d: 'Split blindly by token count and "7 days" lands in one chunk while "damaged items aren\'t eligible" lands in the next. Split on headings first, keep the heading inside the chunk ("Return Policy → Electronics"), then cap the size. Roughly 400 to 600 tokens with 10 to 20% overlap was a decent start, not a rule.' },
    { t: 'Top-K', q: 'How many candidates should come back?', d: 'Too few and the specific policy gets cut. Too many and the context fills with noise the model has to wade through.' },
    { t: 'Similarity threshold', q: 'Are even the closest results relevant?', d: 'So "Who won the FIFA World Cup?" doesn\'t drag in return policies just because they\'re the closest thing. One trap: a similarity of 0.90 is not a 90% chance of being right. Test thresholds against real questions.' },
    { t: 'Metadata filter', q: 'Which subset of documents is eligible?', d: "Narrow the search before it starts, like category in ['electronics', 'general'], so the wrong department's documents never compete." },
    { t: 'Hybrid search + RRF', q: 'How do we combine meaning with exact terms?', d: 'Embeddings capture meaning, so "wireless headphones + fast charging" can match the wrong product. Keyword search (BM25) catches exact codes like AX-204. Run both and merge them with Reciprocal Rank Fusion.' },
    { t: 'Reranking', q: 'Which candidates deserve the top spots?', d: 'A second opinion. Fetch 10 to 20 candidates cheaply, then let a cross-encoder read the question and each document together and keep the top 3 to 5. In my demo the damaged-product policy jumped from fourth to first. It can\'t invent a missing document though, only reorder what retrieval found.' },
    { t: 'Context engineering', q: 'How should the material be handed to the model?', d: 'Even with both policies in context, the model sometimes followed the general 30-day rule over the 7-day electronics one. How you order, label and frame retrieved context matters as much as what you retrieve.' },
  ],
  flow: [
    { t: 'Client → app server', d: 'The chat UI sends the message. Nothing smart yet.' },
    { t: 'Build the context', d: 'The app server loads the system prompt, recent conversation, and the tool list it got from its MCP servers: Calendar, Docs, Email.' },
    { t: 'RAG step', d: 'The app searches the knowledge base for "deployment checklist" and adds the top chunks to the context.' },
    { t: 'First model call', d: 'The LLM reads everything and replies with a tool call: <code>create_event</code> with title, attendee, date, time and duration. Same idea as <code>MeetingRequest</code>, just used as tool arguments.' },
    { t: 'Calendar MCP server', d: 'The MCP client forwards the call. The server talks to the real calendar API and returns "event created".' },
    { t: 'Second model call', d: 'The result goes back to the LLM. Now it asks for <code>send_email</code> to Rahul, with the checklist from step 3 in the body.' },
    { t: 'Loop ends', d: 'The email tool succeeds, the model has nothing left to do, and it writes a normal reply: <b>"Done, the meeting is booked and Rahul has the checklist."</b>' },
  ],
  open: [
    { t: 'Evaluation', d: 'How do you know a change to chunking or Top-K actually made things better, beyond trying five questions by hand?' },
    { t: 'Context engineering, in depth', d: "I've only scratched the surface of ordering and labelling retrieved context so the model follows the specific rule over the general one." },
    { t: 'Tool overload', d: 'When an agent has 40 tools from six MCP servers, how do you keep the model from picking the wrong one?' },
  ],
};
