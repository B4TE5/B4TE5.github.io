// One-shot generator for the encrypted demo URLs embedded in
// assets/js/demo-access.js. Reads secrets from scripts/demos.local.json
// (gitignored). Run with: node scripts/encrypt-demos.mjs
// Copy the JSON output into the ENCRYPTED_DEMOS constant in demo-access.js.
//
// scripts/demos.local.json format:
// {
//   "password": "...",
//   "iterations": 100000,
//   "urls": { "sayndex": "...", "trustforge": "...", "clausulazo": "..." }
// }

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { webcrypto } from "node:crypto";

const subtle = webcrypto.subtle;
const randomBytes = (n) => webcrypto.getRandomValues(new Uint8Array(n));

const here = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(resolve(here, "demos.local.json"), "utf8"));

const PASSWORD = config.password;
const ITERATIONS = config.iterations ?? 100_000;
const URLS = config.urls;

const enc = new TextEncoder();
const salt = randomBytes(16);

const baseKey = await subtle.importKey(
  "raw",
  enc.encode(PASSWORD),
  { name: "PBKDF2" },
  false,
  ["deriveKey"],
);

const key = await subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
  baseKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt"],
);

const toB64 = (buf) => Buffer.from(buf).toString("base64");

const output = {
  salt: toB64(salt),
  iterations: ITERATIONS,
};

for (const [slug, url] of Object.entries(URLS)) {
  const iv = randomBytes(12);
  const ct = await subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(url));
  output[slug] = {
    iv: toB64(iv),
    ciphertext: toB64(ct),
  };
}

console.log(JSON.stringify(output, null, 2));
