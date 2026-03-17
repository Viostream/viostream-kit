/**
 * Test setup for the vendored Viostream embed API tests.
 *
 * The vendored embed API uses Penpal to communicate with iframes via
 * postMessage. In jsdom, iframes lack real content windows, so the Penpal
 * handshake always fails with an unhandled rejection. Vitest catches these
 * at the Node.js process level (not the jsdom window level), so we must
 * install a process-level handler to suppress them.
 */
process.on('unhandledRejection', (reason: unknown) => {
  if (
    reason instanceof Error &&
    reason.name === 'PenpalError'
  ) {
    // Expected in jsdom — suppress silently.
    return;
  }

  // Re-throw anything that isn't a Penpal error so Vitest still catches
  // genuine unhandled rejections.
  throw reason;
});
