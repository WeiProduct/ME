#!/usr/bin/env node
/* =============================================================
   fetch-appstore-data.mjs
   Fetches real, Apple-published App Store metadata for all 17
   live apps via the public iTunes Lookup API and writes a slim
   snapshot to assets/data/appstore.json.

   The site renders ONLY from the committed snapshot (no runtime
   dependency on Apple). Re-run this script to refresh the data:

       node scripts/fetch-appstore-data.mjs
   ============================================================= */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_IDS = [
  '6748370595', // Piggy Accounting (记账2)
  '6748324487', // AI Calendar (AI日历)
  '6748370992', // Habits (WeiRabits)
  '6748373741', // AI Weather (WeathersPro)
  '6748548518', // AI Pomodoro Timer (AI番茄闹钟)
  '6748568205', // AI Vocabulary (AI背单词)
  '6748717022', // Food Calories (AI卡路里)
  '6748549192', // Dating Chat (AI约会助手)
  '6748650326', // Grok iOS: AI Platform (AI平台)
  '6749024443', // AI Smart Light (智能补光师)
  '6749164175', // Meditation (AI冥想)
  '6749191628', // Dailymatters
  '6749191633', // AI Daily Matters (AIDailyMatters)
  '6749165632', // AIMBTI
  '6749274211', // AI Drink Water (AIDrinkWater)
  '6749283592', // AI Note (AI记事本)
  '6748947046'  // AI Voice Notes (AI录音笔记)
];

const NOTES_MAX = 240;

const url = `https://itunes.apple.com/lookup?id=${APP_IDS.join(',')}&country=us`;
const res = await fetch(url);
if (!res.ok) {
  console.error(`iTunes Lookup failed: HTTP ${res.status}`);
  process.exit(1);
}
const data = await res.json();

const apps = (data.results || [])
  .filter((r) => r.wrapperType === 'software')
  .map((r) => ({
    id: String(r.trackId),
    name: r.trackName,
    version: r.version,
    released: r.releaseDate,
    updated: r.currentVersionReleaseDate,
    notes: (r.releaseNotes || '').trim().replace(/\s+/g, ' ').slice(0, NOTES_MAX),
    genre: r.primaryGenreName,
    price: r.price,
    url: r.trackViewUrl
  }));

if (apps.length !== APP_IDS.length) {
  console.warn(`Warning: expected ${APP_IDS.length} apps, got ${apps.length}`);
}

const snapshot = {
  source: 'Apple App Store (iTunes Lookup API)',
  fetched: new Date().toISOString(),
  apps
};

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, 'assets', 'data', 'appstore.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(snapshot, null, 2) + '\n');
console.log(`Wrote ${apps.length} apps to ${out}`);
