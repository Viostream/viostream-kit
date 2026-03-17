/**
 * scripts/update-vendor-embed.mjs
 *
 * Fetches the latest Viostream embed API script from the remote endpoint,
 * applies transformations (deprecated method removal, TypeScript annotations,
 * ESM wrapping), and writes the result to
 * packages/viostream-player-core/src/vendor/viostream-embed.ts.
 *
 * Runs as a prebuild hook — on network failure, falls back to the existing
 * checked-in file with a warning.
 *
 * Usage:
 *   node scripts/update-vendor-embed.mjs
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const REMOTE_URL = 'https://play.viostream.com/api/VC-100100100';
const OUTPUT_PATH = path.join(
  ROOT,
  'packages/viostream-player-core/src/vendor/viostream-embed.ts',
);

/**
 * Deprecated methods to strip from class xe.
 * Each entry is { name, params } where params is the number of IIFE params.
 * Single-param methods use: name(t){this._call("name",t)} or this._get(...)
 * Multi-param methods use more complex bodies — matched with a broader regex.
 */
const DEPRECATED_METHODS = [
  'getLiveCurrentTime',
  'getTracks',
  'setTrack',
  'cueAdd',
  'cueUpdate',
  'cueDelete',
  'asrAdd',
];

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

/** Fetch a URL and return the response body as a string. */
function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        res.resume();
        return;
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15_000, () => {
      req.destroy(new Error(`Timeout fetching ${url}`));
    });
  });
}

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

/**
 * Extract the IIFE body from the raw script.
 * Expected format: (function(w,A){...})(window,document);
 * Returns the content between the outer parens of the function body.
 */
function extractIifeBody(raw) {
  // Strip sourcemap comment
  let code = raw.replace(/\n?\/\/# sourceMappingURL=.*$/m, '').trim();

  // Validate structure: must start with (function(w,A){ and end with })(window,document);
  if (!code.startsWith('(function(w,A){')) {
    throw new Error(
      'Unexpected IIFE start. Expected "(function(w,A){..." — remote script structure may have changed.',
    );
  }
  if (!code.endsWith('})(window,document);')) {
    throw new Error(
      'Unexpected IIFE end. Expected "})(window,document);" — remote script structure may have changed.',
    );
  }

  // Return the full IIFE without the trailing (window,document); invocation
  // We'll re-invoke it with (shim, document) in the wrapper.
  // Strip: leading "(function(w,A){" and trailing "})(window,document);"
  // Actually, we keep the function wrapper and just change the invocation args.
  // So return everything up to but not including })(window,document);
  // then we append })(shim,document);

  // Strip the invocation: })(window,document);
  code = code.slice(0, code.length - '})(window,document);'.length) + '})(shim,document);';

  return code;
}

/**
 * Strip deprecated methods from the minified class xe body.
 *
 * Methods follow one of these patterns in the minified output:
 *   name(t){this._call("name",t)}
 *   name(t){this._get("name",t)}
 *   name(t,r){this._call("name",{...})}
 *
 * We match greedily up to the next method/closing brace.
 */
function stripDeprecatedMethods(code) {
  let result = code;

  for (const name of DEPRECATED_METHODS) {
    // Match: methodName(params){body}
    // The body may contain nested braces (e.g. {cue:t,field:r}), so we
    // use a brace-counting approach.
    const methodStart = result.indexOf(`${name}(`);
    if (methodStart === -1) {
      console.warn(`  ⚠ Deprecated method "${name}" not found in remote script — may have been removed upstream.`);
      continue;
    }

    // Find the opening { of the method body
    let i = result.indexOf('{', methodStart);
    if (i === -1) {
      console.warn(`  ⚠ Could not find method body for "${name}".`);
      continue;
    }

    // Count braces to find the matching }
    let depth = 0;
    let end = i;
    for (; end < result.length; end++) {
      if (result[end] === '{') depth++;
      else if (result[end] === '}') {
        depth--;
        if (depth === 0) {
          end++; // include the closing }
          break;
        }
      }
    }

    result = result.slice(0, methodStart) + result.slice(end);
  }

  return result;
}

/**
 * Apply TypeScript type annotations to the minified code so it compiles
 * under @ts-nocheck without blocking errors.
 *
 * These are deterministic replacements against the minified variable names.
 */
function addTypeAnnotations(code) {
  let result = code;

  // 1. IIFE parameters
  result = result.replace(
    '(function(w,A){',
    '(function(w: Record<string, unknown>,A: Document){',
  );

  // 2. const f=[] (UUID hex lookup table)
  result = result.replace('const f=[]', 'const f: string[]=[]');

  // 3. Function parameters — add `: any` to all untyped params.
  //    We target specific known function signatures in the minified output.
  //    Rather than a fragile global replace, we target each function pattern.
  const paramAnnotations = [
    // UUID functions
    ['function J(e,t=0)', 'function J(e: any,t=0)'],
    ['function q()', 'function q()'],  // no params, skip
    ['function Q(e,t,r)', 'function Q(e?: any,t?: any,r?: any)'],

    // Layout helpers
    ['const Z=(e,t=0)=>', 'const Z=(e: any,t=0)=>'],
    ['ee=(e,t,r,n)=>', 'ee=(e: any,t: any,r: any,n: any)=>'],
    ['te=(e,t,r)=>', 'te=(e: any,t: any,r: any)=>'],
    ['re=(e,t,r,n,s=void 0,a=0)=>', 're=(e: any,t: any,r: any,n: any,s: any=void 0,a=0)=>'],

    // Penpal error
    ['constructor(e,t){super(t)', 'constructor(e: any,t: any){super(t)'],
    ['se=e=>({name:e.name', 'se=(e: any)=>({name:e.name'],
    ['ae=({name:e,message:t,stack:r,penpalCode:n})=>', 'ae=({name:e,message:t,stack:r,penpalCode:n}: any)=>'],

    // Penpal message type checks
    ['le=e=>typeof e', 'le=(e: any)=>typeof e'],
    ['b=e=>e.type==="SYN"', 'b=(e: any)=>e.type==="SYN"'],
    ['N=e=>e.type==="ACK1"', 'N=(e: any)=>e.type==="ACK1"'],
    ['D=e=>e.type==="ACK2"', 'D=(e: any)=>e.type==="ACK2"'],
    ['x=e=>e.type==="CALL"', 'x=(e: any)=>e.type==="CALL"'],
    ['$=e=>e.type==="REPLY"', '$=(e: any)=>e.type==="REPLY"'],
    ['ce=e=>e.type==="DESTROY"', 'ce=(e: any)=>e.type==="DESTROY"'],

    // Penpal utilities
    ['F=(e,t=[])=>', 'F=(e: any,t: any[]=[])=>'],
    ['ue=(e,t)=>', 'ue=(e: any,t: any)=>'],
    ['g=e=>e.join', 'g=(e: any)=>e.join'],
    ['H=(e,t,r)=>', 'H=(e: any,t: any,r: any)=>'],

    // Penpal message handlers
    ['he=(e,t,r,n)=>', 'he=(e: any,t: any,r: any,n: any)=>'],
    ['const a=async c=>{', 'const a=async (c: any)=>{'],
    ['pe=he', 'pe=he'],  // alias, skip
    ['ge=(e,t,r)=>{', 'ge=(e: any,t: any,r: any)=>{'],
    ['W=(e,t,r=[])=>', 'W=(e: any,t: any,r: any[]=[])=>'],
    ['get(n,s){', 'get(n: any,s: any){'],
    ['apply(n,s,a){', 'apply(n: any,s: any,a: any){'],
    ['Y=e=>new y', 'Y=(e: any)=>new y'],

    // Connection handler
    ['Ce=({messenger:e,methods:t,timeout:r,channel:n,log:s})=>{', 'Ce=({messenger:e,methods:t,timeout:r,channel:n,log:s}: any)=>{'],
    ['const E=h=>{', 'const E=(h: any)=>{'],
    ['const O=h=>{', 'const O=(h: any)=>{'],
    ['const I=h=>{', 'const I=(h: any)=>{'],
    ['const B=h=>{', 'const B=(h: any)=>{'],
    ['const P=()=>{const h', 'const P=()=>{const h'],  // skip if no param

    // Te, Re, Ne
    ['Te=e=>{', 'Te=(e: any)=>{'],
    ['Re=Te', 'Re=Te'],  // alias, skip
    ['Ne=({messenger:e,methods:t={},timeout:r,channel:n,log:s})=>{', 'Ne=({messenger:e,methods:t={},timeout:r,channel:n,log:s}: any)=>{'],

    // Messenger class Le
    ['initialize=({log:e,validateReceivedMessage:t})=>{', 'initialize=({log:e,validateReceivedMessage:t}: any)=>{'],
    ['sendMessage=(e,t)=>{', 'sendMessage=(e: any,t?: any)=>{'],
    ['addMessageHandler=e=>{', 'addMessageHandler=(e: any)=>{'],
    ['removeMessageHandler=e=>{', 'removeMessageHandler=(e: any)=>{'],

    // Private methods of Le
    ['#h=e=>', '#h=(e: any)=>'],
    ['#d=e=>{', '#d=(e: any)=>{'],
    ['#u=({source:e,origin:t,ports:r,data:n})=>{', '#u=({source:e,origin:t,ports:r,data:n}: any)=>{'],
    ['#l=({data:e})=>{', '#l=({data:e}: any)=>{'],

    // Penpal deprecated message handling
    ['Ee=e=>_(e)', 'Ee=(e: any)=>_(e)'],
    ['Ae=e=>e.split', 'Ae=(e: any)=>e.split'],
    ['j=e=>e.join', 'j=(e: any)=>e.join'],
    ['_e=e=>{', '_e=(e: any)=>{'],
    ['be=e=>{', 'be=(e: any)=>{'],
    ['Se=e=>{', 'Se=(e: any)=>{'],
    ['K=e=>new y', 'K=(e: any)=>new y'],

    // Logger
    ['ke=e=>(', 'ke=(e: any)=>('],

    // class xe constructor
    ['class xe{constructor(t,r,n){', 'class xe{frame: any;playerSettings: any;remote: any;events: Record<string, any[]>;connection: any;constructor(t: any,r: any,n: any){'],

    // class xe methods
    ['_call(t,r){', '_call(t: any,r?: any){'],
    ['_get(t,r){', '_get(t: any,r: any){'],

    // Player methods with single callback param
    ['getVolume(t){', 'getVolume(t: any){'],
    ['setVolume(t){', 'setVolume(t: any){'],
    ['getLoop(t){', 'getLoop(t: any){'],
    ['setLoop(t){', 'setLoop(t: any){'],
    ['getCurrentTime(t){', 'getCurrentTime(t: any){'],
    ['setCurrentTime(t,r){', 'setCurrentTime(t: any,r: any){'],
    ['getPaused(t){', 'getPaused(t: any){'],
    ['getDuration(t){', 'getDuration(t: any){'],
    ['getMuted(t){', 'getMuted(t: any){'],
    ['getAspectRatio(t){', 'getAspectRatio(t: any){'],
    ['getHeight(t){', 'getHeight(t: any){'],
    ['reload(t){', 'reload(t: any){'],
    ['on(t,r){', 'on(t: any,r: any){'],

    // $e function
    ['function $e(e,t,r={},n=void 0)', 'function $e(e: any,t: any,r: any={},n: any=void 0)'],

    // Ie/we (deferred promise)
    ['Ie=we', 'Ie=we'],  // alias, skip

    // Le constructor
    ['constructor({remoteWindow:e,allowedOrigins:t})', 'constructor({remoteWindow:e,allowedOrigins:t}: any)'],

    // Oe class  
    ['Oe=Le', 'Oe=Le'],  // alias, skip

    // Ue
    ['Ue=ke', 'Ue=ke'],  // alias, skip

    // oe (Reply) constructor
    ['de=oe', 'de=oe'],  // alias, skip

    // Me
    ['Me=ge', 'Me=ge'],  // alias, skip

    // emit in connection methods
    ['emit(p,u){', 'emit(p: any,u: any){'],

    // the P,E in promise handlers
    ['new Promise((P,E)=>{', 'new Promise((P: any,E: any)=>{'],

    // De connection
    ['De=Ne', 'De=Ne'],  // alias, skip

    // Connection handler inner functions
    ['const P=()=>{const h={', 'const P=()=>{const h: any={'],
    ['const h={namespace:m,type:"SYN"', 'const h: any={namespace:m,type:"SYN"'],
  ];

  for (const [from, to] of paramAnnotations) {
    if (from === to) continue; // skip aliases
    if (result.includes(from)) {
      result = result.replace(from, to);
    }
  }

  // 4. Cast w.trackerParams access: w.trackerParams -> (w as any).trackerParams
  result = result.replace(/(?<!\()w\.trackerParams/g, '(w as any).trackerParams');

  // 5. Cast w.$viostream: w.$viostream -> (w as any).$viostream
  result = result.replace(/w\.\$viostream/g, '(w as any).$viostream');

  // 6. Cast w.location in $e: r.documentLocation=w.location.href
  //    -> r.documentLocation=(w.location as Location).href
  result = result.replace(
    'r.documentLocation=w.location.href',
    'r.documentLocation=(w.location as Location).href',
  );

  // 7. Cast A.getElementById returns in $e and re to HTMLElement
  //    In re: const d=A.getElementById(r),v= -> const d=A.getElementById(r) as HTMLElement;d&&(d.innerHTML="");const v=
  result = result.replace(
    'const d=A.getElementById(r),v=te(r,u,a);d.appendChild(v)',
    'const d=A.getElementById(r) as HTMLElement;d&&(d.innerHTML="");const v=te(r,u,a);d.appendChild(v)',
  );

  //    In $e: document.getElementById(t) -> A.getElementById(t) as HTMLElement
  //    Note: raw uses `document.getElementById` here, not `A.getElementById`
  result = result.replace(
    'const s=document.getElementById(t);s&&(s.innerHTML="")',
    'const s=A.getElementById(t) as HTMLElement;s&&(s.innerHTML="")',
  );

  // 8. Cast l.dataset in re: l.dataset.aspectRatioForced -> (l as any).dataset.aspectRatioForced
  result = result.replace(
    'l.dataset.aspectRatioForced',
    '(l as any).dataset.aspectRatioForced',
  );

  return result;
}

/**
 * Generate the full output file contents.
 */
function generateOutput(transformedIife) {
  return `\
/**
 * Vendored Viostream embed API.
 *
 * This file wraps the minified embed API script (originally served from
 * \`https://play.viostream.com/api/{accountKey}\`) as an ES module export.
 *
 * The IIFE receives a shim object instead of \`window\` so that:
 * - \`w.playerDomain\` reads the \`host\` parameter
 * - \`w.$viostream\` writes to a local variable instead of the global
 * - \`w.location\` proxies to \`document.location\`
 * - \`w.trackerParams\` still reads from \`window\` (backward compatible)
 *
 * ## Replacing with unminified ESM source
 *
 * To swap this out later, replace the body of \`createEmbedApi()\` with
 * a clean ESM import. The rest of the codebase only depends on the
 * \`createEmbedApi(host: string): ViostreamGlobal\` signature.
 *
 * ## Deprecated methods
 *
 * The following methods have been stripped from the vendored player class:
 * \`getLiveCurrentTime\`, \`getTracks\`, \`setTrack\`, \`cueAdd\`, \`cueUpdate\`,
 * \`cueDelete\`, \`asrAdd\`. See AGENTS.md for rationale.
 *
 * ---
 * AUTO-GENERATED by scripts/update-vendor-embed.mjs — do not edit manually.
 */

/* eslint-disable */
// @ts-nocheck — Vendored minified code; type annotations are minimal.

import type { ViostreamGlobal } from '../types.js';

/**
 * Create a Viostream embed API instance bound to the given host.
 *
 * @param host - The Viostream API hostname (e.g. \`'play.viostream.com'\`).
 * @returns A \`ViostreamGlobal\`-compatible object with an \`embed()\` method.
 */
export function createEmbedApi(host: string): ViostreamGlobal {
  // The shim replaces \`window\` as the first argument to the IIFE.
  // This avoids mutating the real \`window.$viostream\` global.
  const shim: Record<string, unknown> = {
    playerDomain: host,
    get location() { return document.location; },
    get trackerParams() { return (window as unknown as Record<string, unknown>).trackerParams; },
  };

  // --- BEGIN VENDORED MINIFIED CODE ---
  // Source: ${REMOTE_URL}
  // Deprecated methods (getLiveCurrentTime, getTracks, setTrack, cueAdd,
  // cueUpdate, cueDelete, asrAdd) have been removed from class xe.
  ${transformedIife}
  // --- END VENDORED MINIFIED CODE ---

  return (shim as Record<string, any>).$viostream as ViostreamGlobal;
}
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('==> Updating vendored Viostream embed API...');

  // 1. Fetch
  let raw;
  try {
    raw = await fetchText(REMOTE_URL);
    console.log(`  Fetched ${raw.length} bytes from ${REMOTE_URL}`);
  } catch (err) {
    console.warn(`  ⚠ Could not fetch remote script: ${err.message}`);
    console.warn('  Keeping existing vendored file.');
    return;
  }

  // 2. Transform
  let code;
  try {
    code = extractIifeBody(raw);
  } catch (err) {
    console.warn(`  ⚠ ${err.message}`);
    console.warn('  Keeping existing vendored file.');
    return;
  }

  code = stripDeprecatedMethods(code);
  code = addTypeAnnotations(code);

  // 3. Generate full output
  const output = generateOutput(code);

  // 4. Compare with existing file
  let existing = '';
  try {
    existing = fs.readFileSync(OUTPUT_PATH, 'utf8');
  } catch {
    // File doesn't exist yet — that's fine
  }

  if (output === existing) {
    console.log('  Vendor embed is up to date — no changes.');
    return;
  }

  // 5. Write
  const dir = path.dirname(OUTPUT_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`  Updated ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main().catch((err) => {
  console.error('  ✗ Unexpected error:', err.message);
  console.warn('  Keeping existing vendored file.');
  process.exitCode = 0; // Don't fail the build
});
