/**
 * Seed script for RAW Aviation Blog
 * Creates sample authors, articles, reports, and galleries with placeholder images
 *
 * Run from cms/: npm run seed   (or: node seed.mjs)
 *
 * Requires in cms/.env (never commit real values):
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_USER_PASSWORD
 * Optional: STRAPI_URL (default http://localhost:1337)
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Load cms/.env into process.env without overwriting existing vars. */
function loadLocalEnv() {
  const envPath = join(__dirname, '.env');
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) continue;
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

function assertSeedEnv() {
  const missing = [];
  if (!process.env.SEED_ADMIN_EMAIL?.trim()) missing.push('SEED_ADMIN_EMAIL');
  if (!process.env.SEED_ADMIN_PASSWORD) missing.push('SEED_ADMIN_PASSWORD');
  if (!process.env.SEED_USER_PASSWORD) missing.push('SEED_USER_PASSWORD');
  if (missing.length) {
    console.error(`
Seed script is missing: ${missing.join(', ')}

Add these to cms/.env (copy from cms/.env.example). They are not hardcoded so
passwords never need to live in Git:

  SEED_ADMIN_EMAIL=<Strapi admin email>
  SEED_ADMIN_PASSWORD=<Strapi admin password>
  SEED_USER_PASSWORD=<password for seeded frontend users>

`);
    process.exit(1);
  }
}

let strapiBase = 'http://localhost:1337';
let ADMIN_TOKEN = '';

// ─── Auth ────────────────────────────────────────────────────────────────────

async function login() {
  const res = await fetch(`${strapiBase}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SEED_ADMIN_EMAIL.trim(),
      password: process.env.SEED_ADMIN_PASSWORD,
    }),
  });
  const data = await res.json();
  if (!data.data?.token) throw new Error('Login failed: ' + JSON.stringify(data));
  ADMIN_TOKEN = data.data.token;
  console.log('  Logged in as admin');
}

function adminHeaders(json = false) {
  const h = { Authorization: `Bearer ${ADMIN_TOKEN}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

// ─── Image generation & upload ───────────────────────────────────────────────

function makeSVG(width, height, bgColor, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000;stop-opacity:0.6" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${Math.floor(Math.min(width, height) / 10)}"
        fill="white" fill-opacity="0.9" font-weight="bold">${label}</text>
  <text x="50%" y="${height * 0.65}" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${Math.floor(Math.min(width, height) / 20)}"
        fill="white" fill-opacity="0.5">RAW Aviation</text>
</svg>`;
}

async function uploadImage(filename, width, height, bgColor, label, altText) {
  const svg = makeSVG(width, height, bgColor, label);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const formData = new FormData();
  formData.append('files', blob, filename);
  formData.append('fileInfo', JSON.stringify({ alternativeText: altText, caption: altText }));

  const res = await fetch(`${strapiBase}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  console.log(`    Uploaded: ${filename} (id: ${data[0].id})`);
  return data[0];
}

// ─── Create users via register API ──────────────────────────────────────────

async function createUser(username, email) {
  const res = await fetch(`${strapiBase}/api/auth/local/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      password: process.env.SEED_USER_PASSWORD,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Create user failed: ${JSON.stringify(data.error)}`);
  console.log(`    Created user: ${username} (id: ${data.user.id})`);
  return data.user;
}

// ─── Create content via admin content-manager API ────────────────────────────

async function createEntry(contentType, payload) {
  // Strapi 5 admin content-manager uses UID format
  const uid = `api::${contentType}.${contentType}`;
  const url = `${strapiBase}/content-manager/collection-types/${uid}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: adminHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create ${contentType} failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const entry = data.data || data;

  // Publish the entry
  if (entry.documentId) {
    const pubUrl = `${strapiBase}/content-manager/collection-types/${uid}/${entry.documentId}/actions/publish`;
    const pubRes = await fetch(pubUrl, {
      method: 'POST',
      headers: adminHeaders(true),
      body: JSON.stringify({}),
    });
    if (!pubRes.ok) {
      console.warn(`    Warning: publish failed for ${contentType} ${entry.id}`);
    }
  }

  return entry;
}

// ─── Rich content blocks helper ─────────────────────────────────────────────

function richContent(sections) {
  const blocks = [];
  for (const section of sections) {
    if (section.heading) {
      blocks.push({
        type: 'heading',
        level: section.level || 2,
        children: [{ type: 'text', text: section.heading }],
      });
    }
    if (section.paragraphs) {
      for (const text of section.paragraphs) {
        blocks.push({
          type: 'paragraph',
          children: [{ type: 'text', text }],
        });
      }
    }
  }
  return blocks;
}

// ─── MAIN SEED ───────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n  RAW Aviation Blog - Seed Script\n');
  console.log('='.repeat(50) + '\n');

  loadLocalEnv();
  strapiBase = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
  assertSeedEnv();

  await login();

  // ── Step 1: Upload profile photos ──
  console.log('\n[1/6] Uploading profile photos...');
  const profilePhoto1 = await uploadImage('author-andrea.svg', 400, 400, '#1e3a5f', 'AR', 'Andrea Rizzo profile photo');
  const profilePhoto2 = await uploadImage('author-marco.svg', 400, 400, '#2d5a3d', 'MR', 'Marco Rossi profile photo');
  const profilePhoto3 = await uploadImage('author-elena.svg', 400, 400, '#5a2d4a', 'EB', 'Elena Bianchi profile photo');

  // ── Step 2: Create users ──
  console.log('\n[2/6] Creating users...');
  const user1 = await createUser('andrea.rizzo', 'andrea@rawaviation.com');
  const user2 = await createUser('marco.rossi', 'marco@rawaviation.com');
  const user3 = await createUser('elena.bianchi', 'elena@rawaviation.com');

  // ── Step 3: Create author profiles ──
  console.log('\n[3/6] Creating author profiles...');

  const authorData = [
    {
      user: user1.id,
      displayName: 'Andrea Rizzo',
      bio: 'Founder of RAW Aviation and passionate aviation photographer. With over 15 years of experience covering airshows, military exercises, and civilian aviation across Europe, Andrea brings a unique perspective to every story.',
      profilePhoto: profilePhoto1.id,
      position: 'Founder & Editor-in-Chief',
      isPublicAuthor: true,
      authorType: 'founder',
      authorSlug: 'andrea-rizzo',
      showContributionCount: true,
      instagram: 'rawaviation',
      facebook: 'rawaviation',
      orderWeight: 100,
    },
    {
      user: user2.id,
      displayName: 'Marco Rossi',
      bio: 'Aviation journalist and former military pilot. Marco specializes in detailed technical reports on modern fighter aircraft and defense technology, contributing expert analysis to RAW Aviation.',
      profilePhoto: profilePhoto2.id,
      position: 'Senior Aviation Correspondent',
      isPublicAuthor: true,
      authorType: 'external_contributor',
      authorSlug: 'marco-rossi',
      showContributionCount: true,
      instagram: 'marcoaviator',
      orderWeight: 200,
    },
    {
      user: user3.id,
      displayName: 'Elena Bianchi',
      bio: 'Freelance aviation photographer and writer based in Rome. Elena focuses on civilian aviation, airline reviews, and airport spotting, bringing a fresh eye to the world of commercial flight.',
      profilePhoto: profilePhoto3.id,
      position: 'Contributing Photographer',
      isPublicAuthor: true,
      authorType: 'external_contributor',
      authorSlug: 'elena-bianchi',
      showContributionCount: false,
      facebook: 'elenaaviationphoto',
      orderWeight: 300,
    },
  ];

  const authors = [];
  for (const ad of authorData) {
    const entry = await createEntry('author-profile', ad);
    console.log(`    Created author: ${ad.displayName} (id: ${entry.id})`);
    authors.push(entry);
  }

  // ── Step 4: Upload article images & create articles ──
  console.log('\n[4/6] Creating articles...');

  const articleConfigs = [
    {
      img: { file: 'eurofighter-riat.svg', bg: '#1a365d', label: 'Eurofighter at RIAT 2025', alt: 'Eurofighter Typhoon performing at RIAT 2025' },
      data: {
        Title: 'RIAT 2025: A Spectacular Return to Fairford',
        Slug: 'riat-2025-spectacular-return-fairford',
        Date: '2025-07-20',
        authorIds: [0, 1],
        Content: richContent([
          { paragraphs: ['The Royal International Air Tattoo returned to RAF Fairford in July 2025 with one of its most impressive line-ups in recent years. Over 250 aircraft from 30 nations descended on the Gloucestershire airfield, drawing crowds of nearly 170,000 spectators across the three-day event.'] },
          { heading: 'Highlights of the Flying Display', paragraphs: [
            'The flying display programme was nothing short of extraordinary. The Eurofighter Typhoon from the Italian Air Force opened proceedings with a thunderous solo display, showcasing the raw power and agility of Europe\'s premier multi-role fighter.',
            'Perhaps the most anticipated moment came when the United States Air Force debuted their F-35A Lightning II Heritage Flight, pairing the fifth-generation stealth fighter with a beautifully restored P-51D Mustang. The contrast between old and new captivated the crowd.',
            'The RAF\'s own Red Arrows, celebrating their 60th display season, delivered a masterclass in precision aerobatics. Their iconic red, white, and blue smoke trails painted the Cotswold sky in spectacular fashion.',
          ]},
          { heading: 'Static Display Standouts', paragraphs: [
            'On the ground, the static display was equally impressive. A rare appearance by a USAF B-2 Spirit stealth bomber drew enormous crowds, while the Airbus A400M Atlas demonstrated its tactical capabilities with a series of impressive short-field demonstrations.',
            'The international participation was remarkable, with first-time appearances from the South Korean Air Force\'s T-50 Golden Eagle and the Brazilian Air Force\'s KC-390 Millennium.',
          ]},
          { heading: 'Looking Ahead', paragraphs: [
            'RIAT 2025 has set a new benchmark for international air shows. The organisers have already confirmed dates for RIAT 2026, promising even more spectacular displays. For aviation enthusiasts, the tattoo remains an unmissable event on the global calendar.',
          ]},
        ]),
      },
    },
    {
      img: { file: 'f35-debut.svg', bg: '#2d3748', label: 'F-35 Lightning II', alt: 'F-35A Lightning II making its airshow debut' },
      data: {
        Title: 'F-35 Lightning II: Italy\'s Growing Fleet Takes Center Stage',
        Slug: 'f-35-lightning-ii-italy-growing-fleet',
        Date: '2025-06-15',
        authorIds: [1],
        Content: richContent([
          { paragraphs: ['The Italian Air Force has reached a significant milestone with its F-35 programme, now operating 30 Lightning II aircraft across two operational squadrons. This achievement marks Italy as one of the largest European operators of the fifth-generation stealth fighter.'] },
          { heading: 'Operational Capability', paragraphs: [
            'Based at Amendola Air Base in Puglia, the 13th and 32nd Squadrons have achieved Full Operational Capability (FOC) with their F-35A variants. The aircraft have been integrated into NATO\'s air policing missions and have participated in multiple international exercises.',
            'The Italian F-35s have already logged over 15,000 flight hours, with pilots praising the aircraft\'s sensor fusion capabilities and its ability to operate in contested airspace.',
          ]},
          { heading: 'The F-35B at Cameri', paragraphs: [
            'Italy\'s unique position as a partner in the F-35 programme is further highlighted by the Final Assembly and Check Out (FACO) facility at Cameri, near Novara. This facility not only assembles F-35A variants for the Italian Air Force but also produces F-35B STOVL variants for the Italian Navy.',
            'The short take-off and vertical landing capability of the F-35B has transformed the Italian Navy\'s carrier aviation, with the aircraft now operating from the aircraft carrier ITS Cavour.',
          ]},
          { heading: 'Future Outlook', paragraphs: [
            'Italy plans to acquire a total of 90 F-35s (60 A-variants and 30 B-variants), making it one of the most significant procurement programmes in Italian defence history. The programme continues to evolve with Block 4 upgrades promising enhanced capabilities.',
          ]},
        ]),
      },
    },
    {
      img: { file: 'frecce-tricolori.svg', bg: '#22543d', label: 'Frecce Tricolori', alt: 'Frecce Tricolori aerobatic team' },
      data: {
        Title: 'Frecce Tricolori: 65 Years of Italian Pride in the Sky',
        Slug: 'frecce-tricolori-65-years-italian-pride',
        Date: '2025-05-10',
        authorIds: [0],
        Content: richContent([
          { paragraphs: ['The Pattuglia Acrobatica Nazionale, better known as the Frecce Tricolori, celebrated their 65th anniversary in 2025 with a series of special performances across Italy and Europe. As the world\'s largest aerobatic team with ten aircraft, the team continues to represent the pinnacle of precision flying.'] },
          { heading: 'A Legacy of Excellence', paragraphs: [
            'Formed in 1961 at Rivolto Air Base in Friuli, the Frecce Tricolori have performed over 2,500 official displays in 56 countries. Flying the Aermacchi MB-339A/PAN, the team executes manoeuvres that have become legendary in the aerobatic world.',
            'The team\'s signature manoeuvre, the "Bomba," sees all ten aircraft dive from different directions toward a central point, crossing paths at breathtaking proximity. It remains one of the most dramatic sequences in world aerobatics.',
          ]},
          { heading: 'Transition to the M-346', paragraphs: [
            'The team is preparing for a historic transition to the Leonardo M-346 Master, which will replace the aging MB-339A fleet. This modern trainer offers improved performance, reliability, and reduced operating costs while maintaining the team\'s trademark smoke system in the Italian tricolour.',
            'The transition period is expected to begin in late 2026, with the team working up to full display capability on the new type by 2027.',
          ]},
          { heading: 'Anniversary Celebrations', paragraphs: [
            'The 65th-anniversary season included special displays at Rivolto Open Day, drawing over 400,000 spectators. Guest teams from Switzerland (Patrouille Suisse), France (Patrouille de France), and Spain (Patrulla Aguila) joined the celebrations in a rare gathering of European aerobatic excellence.',
          ]},
        ]),
      },
    },
    {
      img: { file: 'airbus-a350.svg', bg: '#553c9a', label: 'Airbus A350-1000', alt: 'Airbus A350-1000 at Farnborough' },
      data: {
        Title: 'Farnborough 2024: Commercial Aviation\'s New Horizons',
        Slug: 'farnborough-2024-commercial-aviation-new-horizons',
        Date: '2025-03-22',
        authorIds: [2],
        Content: richContent([
          { paragraphs: ['The Farnborough International Airshow once again served as the stage for the commercial aviation industry\'s biggest announcements. From record-breaking orders to revolutionary new technologies, the 2024 edition delivered on every front.'] },
          { heading: 'Order Bonanza', paragraphs: [
            'The show saw orders and commitments worth over $120 billion, with Airbus and Boeing both securing major deals. Airbus announced 400 new orders for the A320neo family, while Boeing countered with significant 787 Dreamliner commitments from several Asian carriers.',
            'The surprise of the show was a launch order for a new regional aircraft from an emerging manufacturer, signalling growing competition in the 100-150 seat segment.',
          ]},
          { heading: 'Sustainable Aviation Focus', paragraphs: [
            'Sustainability dominated the conversation, with both major manufacturers showcasing their hydrogen and sustainable aviation fuel (SAF) initiatives. Airbus presented updated concepts for its ZEROe hydrogen-powered aircraft programme, while Rolls-Royce demonstrated a hydrogen fuel cell system for smaller aircraft.',
          ]},
          { heading: 'The A350-1000 Steals the Show', paragraphs: [
            'In the flying display, the Airbus A350-1000 captivated audiences with a remarkably dynamic demonstration, proving that wide-body aircraft can put on an impressive aerial show.',
          ]},
        ]),
      },
    },
    {
      img: { file: 'red-arrows.svg', bg: '#9b2c2c', label: 'Red Arrows', alt: 'RAF Red Arrows formation display' },
      data: {
        Title: 'Red Arrows Celebrate 60 Glorious Display Seasons',
        Slug: 'red-arrows-60-display-seasons',
        Date: '2025-04-18',
        authorIds: [0, 2],
        Content: richContent([
          { paragraphs: ['The Royal Air Force Aerobatic Team, the Red Arrows, marked their 60th display season in 2025 with a special programme of events celebrating six decades of inspiring millions of people around the world.'] },
          { heading: 'Six Decades of Excellence', paragraphs: [
            'Since their formation in 1965, the Red Arrows have performed nearly 5,000 displays in 57 countries. The team\'s nine distinctive red BAe Systems Hawk T1 jets have become synonymous with precision, teamwork, and the very best of the Royal Air Force.',
            'The 60th anniversary display featured a new sequence incorporating elements from every decade of the team\'s history.',
          ]},
          { heading: 'The Hawk\'s Enduring Service', paragraphs: [
            'The BAe Hawk T1 has served the Red Arrows since 1979, replacing the Folland Gnat. Despite its age, the aircraft continues to perform admirably, though discussions about a future replacement platform are ongoing.',
          ]},
          { heading: 'Inspiring the Next Generation', paragraphs: [
            'Beyond their role as entertainers, the Red Arrows serve as ambassadors for STEM education and RAF recruitment. Their engagement programme visits schools across the UK, inspiring young people to pursue careers in science, technology, engineering, and mathematics.',
          ]},
        ]),
      },
    },
  ];

  for (const cfg of articleConfigs) {
    const img = await uploadImage(cfg.img.file, 1200, 675, cfg.img.bg, cfg.img.label, cfg.img.alt);
    const entry = await createEntry('article', {
      ...cfg.data,
      Featured_Image: img.id,
      authors: cfg.data.authorIds.map(i => authors[i].documentId),
    });
    console.log(`    Created article: "${cfg.data.Title}" (id: ${entry.id})`);
  }

  // ── Step 5: Create reports ──
  console.log('\n[5/6] Creating reports...');

  const reportConfigs = [
    {
      mainImg: { file: 'nato-tiger-main.svg', bg: '#744210', label: 'NATO Tiger Meet 2025', alt: 'NATO Tiger Meet 2025' },
      extraImgs: [
        { file: 'tiger-f16.svg', bg: '#975a16', label: 'Tiger F-16', alt: 'Tiger-striped F-16' },
        { file: 'tiger-rafale.svg', bg: '#b7791f', label: 'Tiger Rafale', alt: 'French Rafale in tiger livery' },
        { file: 'tiger-typhoon.svg', bg: '#d69e2e', label: 'Tiger Typhoon', alt: 'German Typhoon tiger scheme' },
      ],
      data: {
        Title: 'NATO Tiger Meet 2025: Predators Unite at Beja Air Base',
        Slug: 'nato-tiger-meet-2025-beja',
        Date: '2025-06-28',
        authorIds: [0, 1],
        Content: richContent([
          { paragraphs: ['NATO Tiger Meet 2025, hosted by the Portuguese Air Force at Beja Air Base, brought together 18 squadrons from 12 NATO nations for two weeks of intensive multinational training. This year\'s edition was widely regarded as one of the best Tiger Meets in recent memory.'] },
          { heading: 'Exercise Overview', paragraphs: [
            'The exercise ran from June 16-28, featuring daily COMAO sorties involving up to 60 aircraft. The training scenarios included air superiority missions, close air support, and complex strike packages against simulated integrated air defence systems.',
            'Participating nations included Belgium, Czech Republic, France, Germany, Greece, Hungary, Italy, Netherlands, Norway, Poland, Portugal, and Spain.',
          ]},
          { heading: 'Special Tiger Liveries', paragraphs: [
            'As tradition dictates, several squadrons unveiled stunning special paint schemes. The Belgian Air Component\'s F-16 featured an orange and black tiger scheme that quickly became the crowd favourite during the spotters\' day.',
            'The French Rafale from EC 1/12 sported an intricate tiger design across the entire fuselage, while the German Typhoon presented a striking tiger stripe scheme on its tail and spine.',
          ]},
          { heading: 'Results and Recognition', paragraphs: [
            'The coveted Silver Tiger Trophy was awarded to the Polish F-16 squadron from Poznan-Krzesiny. The Best Tiger Livery award went to the Belgian F-16, while the Spirit of Tiger Meet award was presented to the Hungarian Gripen squadron.',
          ]},
        ]),
      },
    },
    {
      mainImg: { file: 'exercise-trident.svg', bg: '#1a365d', label: 'Exercise Trident Juncture', alt: 'NATO Exercise Trident Juncture' },
      extraImgs: [
        { file: 'trident-c17.svg', bg: '#2a4365', label: 'C-17 Globemaster', alt: 'C-17 airdrop operations' },
        { file: 'trident-f18.svg', bg: '#2c5282', label: 'F/A-18 Hornet', alt: 'Spanish F/A-18 Hornet' },
        { file: 'trident-nh90.svg', bg: '#3182ce', label: 'NH90 Helicopter', alt: 'NH90 helicopter assault' },
      ],
      data: {
        Title: 'Exercise Trident Juncture: NATO\'s Largest Air Exercise',
        Slug: 'exercise-trident-juncture-nato-largest',
        Date: '2025-05-15',
        authorIds: [1],
        Content: richContent([
          { paragraphs: ['Exercise Trident Juncture 2025 was NATO\'s most ambitious air exercise in over a decade, involving more than 200 aircraft and 10,000 personnel from 25 allied nations.'] },
          { heading: 'Scale and Scope', paragraphs: [
            'The exercise encompassed air operations across eight nations, with major operating bases in Norway, Germany, and the Netherlands. The scenario simulated a collective defence response under Article 5 conditions.',
            'Air operations included strategic airlift with C-17 Globemaster IIIs and A400M Atlas transports, aerial refuelling, and massed fighter operations involving F-35s, Typhoons, Rafales, and F-16s.',
          ]},
          { heading: 'Airlift and Mobility', paragraphs: [
            'The strategic airlift component moved over 5,000 personnel and 2,000 tonnes of equipment in the opening 72 hours. The C-17 fleet conducted multiple airdrop operations, including a brigade-level parachute assault.',
          ]},
          { heading: 'Lessons Learned', paragraphs: [
            'The exercise highlighted both NATO\'s strengths and areas for improvement. Interoperability between fifth-generation and fourth-generation fighters proved highly effective.',
          ]},
        ]),
      },
    },
    {
      mainImg: { file: 'aviano-openday.svg', bg: '#2d3748', label: 'Aviano Open Day 2025', alt: 'Aviano Air Base Open Day' },
      extraImgs: [
        { file: 'aviano-f16.svg', bg: '#4a5568', label: 'F-16 Viper Demo', alt: 'F-16 Viper demonstration' },
        { file: 'aviano-static.svg', bg: '#718096', label: 'Static Display', alt: 'Aviano static display' },
        { file: 'aviano-kc135.svg', bg: '#a0aec0', label: 'KC-135', alt: 'KC-135 Stratotanker' },
      ],
      data: {
        Title: 'Aviano Air Base Open Day 2025: American Power in the Dolomites',
        Slug: 'aviano-air-base-open-day-2025',
        Date: '2025-04-05',
        authorIds: [0, 2],
        Content: richContent([
          { paragraphs: ['Aviano Air Base, home to the USAF\'s 31st Fighter Wing, opened its gates to the public in April 2025 for a spectacular open day against the stunning backdrop of the Italian Dolomites.'] },
          { heading: 'The F-16 Viper Demo', paragraphs: [
            'The star of the show was the F-16 Viper Demonstration Team. The solo pilot pushed the Fighting Falcon to its limits, performing high-G turns, maximum-rate climbs, and a dramatic slow-speed pass.',
          ]},
          { heading: 'Static Display', paragraphs: [
            'The static display featured KC-135 Stratotanker, C-130J Super Hercules, and HH-60G Pave Hawk. Allied contributions included an Italian Eurofighter Typhoon, German Tornado, and French Mirage 2000.',
          ]},
          { heading: 'Community Engagement', paragraphs: [
            'Over 50,000 visitors attended, reflecting the strong relationship between the base and the local Italian community. The event also featured STEM outreach exhibits from the 31st Maintenance Group.',
          ]},
        ]),
      },
    },
  ];

  for (const cfg of reportConfigs) {
    const mainImg = await uploadImage(cfg.mainImg.file, 1200, 675, cfg.mainImg.bg, cfg.mainImg.label, cfg.mainImg.alt);
    const extraImgIds = [];
    for (const ei of cfg.extraImgs) {
      const img = await uploadImage(ei.file, 1200, 675, ei.bg, ei.label, ei.alt);
      extraImgIds.push(img.id);
    }
    const entry = await createEntry('report', {
      ...cfg.data,
      MainImage: mainImg.id,
      Images: extraImgIds,
      authors: cfg.data.authorIds.map(i => authors[i].documentId),
    });
    console.log(`    Created report: "${cfg.data.Title}" (id: ${entry.id})`);
  }

  // ── Step 6: Create galleries ──
  console.log('\n[6/6] Creating galleries...');

  const galleryConfigs = [
    {
      images: [
        { file: 'poznan-f22.svg', bg: '#1a365d', label: 'F-22 Raptor', alt: 'F-22 Raptor at Poznan Airshow' },
        { file: 'poznan-f18.svg', bg: '#2d3748', label: 'F/A-18 Hornet', alt: 'F/A-18 Super Hornet display' },
        { file: 'poznan-typhoon.svg', bg: '#22543d', label: 'Eurofighter', alt: 'Eurofighter Typhoon solo display' },
        { file: 'poznan-p51.svg', bg: '#744210', label: 'P-51 Mustang', alt: 'P-51 Mustang heritage flight' },
        { file: 'poznan-gripen.svg', bg: '#702459', label: 'Gripen E', alt: 'JAS 39 Gripen E demonstration' },
        { file: 'poznan-f16.svg', bg: '#9b2c2c', label: 'F-16 Falcon', alt: 'F-16 Fighting Falcon' },
      ],
      data: {
        Title: 'Poznan Airshow 2025: The Best of Military Aviation',
        slug: 'poznan-airshow-2025-military-aviation',
        Date: '2025-08-15',
        authorIds: [0, 1],
        Description: 'A stunning collection of photographs from the Poznan International Airshow 2025, featuring some of the world\'s most advanced military aircraft. From fifth-generation stealth fighters to classic warbirds, this gallery captures the raw power and beauty of military aviation.',
      },
    },
    {
      images: [
        { file: 'duxford-spitfire.svg', bg: '#4a3728', label: 'Spitfire', alt: 'Supermarine Spitfire Mk IX' },
        { file: 'duxford-hurricane.svg', bg: '#5a4a3a', label: 'Hurricane', alt: 'Hawker Hurricane Mk IIc' },
        { file: 'duxford-lancaster.svg', bg: '#3a4a2a', label: 'Lancaster', alt: 'Avro Lancaster bomber' },
        { file: 'duxford-mosquito.svg', bg: '#6a5a3a', label: 'Mosquito', alt: 'De Havilland Mosquito' },
        { file: 'duxford-corsair.svg', bg: '#4a5a6a', label: 'Corsair', alt: 'Vought F4U Corsair' },
        { file: 'duxford-mustang.svg', bg: '#7a6a4a', label: 'Mustang', alt: 'P-51D Mustang' },
      ],
      data: {
        Title: 'Heritage Flight: Warbirds Over Duxford',
        slug: 'heritage-flight-warbirds-duxford',
        Date: '2025-07-05',
        authorIds: [2],
        Description: 'The Imperial War Museum Duxford hosted its annual Heritage Flight weekend, bringing together some of the finest restored warbirds in Europe. From Spitfires to Mustangs, these living legends took to the skies in a breathtaking tribute to aviation history.',
      },
    },
    {
      images: [
        { file: 'malpensa-a380.svg', bg: '#1e3a5f', label: 'A380', alt: 'Airbus A380 at Milan Malpensa' },
        { file: 'malpensa-747.svg', bg: '#2a4a6f', label: 'B747-8', alt: 'Boeing 747-8 freighter' },
        { file: 'malpensa-a350.svg', bg: '#3a5a7f', label: 'A350', alt: 'Airbus A350 approach' },
        { file: 'malpensa-787.svg', bg: '#4a6a8f', label: '787 Dreamliner', alt: 'Boeing 787 Dreamliner landing' },
        { file: 'malpensa-a321.svg', bg: '#5a7a9f', label: 'A321neo', alt: 'Airbus A321neo takeoff' },
        { file: 'malpensa-777x.svg', bg: '#1a4a7a', label: 'B777X', alt: 'Boeing 777X test flight' },
      ],
      data: {
        Title: 'Spotting at Milan Malpensa: A Day on the Threshold',
        slug: 'spotting-milan-malpensa-threshold',
        Date: '2025-06-20',
        authorIds: [2],
        Description: 'An afternoon of aviation photography at Milan Malpensa International Airport, capturing the diverse range of airline traffic. From the majestic Airbus A380 to the latest narrow-body jets, Malpensa offers endless spotting opportunities.',
      },
    },
  ];

  for (const cfg of galleryConfigs) {
    const imageIds = [];
    for (const img of cfg.images) {
      const uploaded = await uploadImage(img.file, 1200, 800, img.bg, img.label, img.alt);
      imageIds.push(uploaded.id);
    }
    const entry = await createEntry('gallery', {
      ...cfg.data,
      Images: imageIds,
      authors: cfg.data.authorIds.map(i => authors[i].documentId),
    });
    console.log(`    Created gallery: "${cfg.data.Title}" (id: ${entry.id})`);
  }

  // ── Done ──
  console.log('\n' + '='.repeat(50));
  console.log('Seed complete!');
  console.log(`  - 3 Author Profiles`);
  console.log(`  - ${articleConfigs.length} Articles`);
  console.log(`  - ${reportConfigs.length} Reports`);
  console.log(`  - ${galleryConfigs.length} Galleries`);
  console.log(`\nFrontend: http://localhost:3000`);
  console.log(`Strapi Admin: http://localhost:1337/admin\n`);
}

seed().catch(err => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
