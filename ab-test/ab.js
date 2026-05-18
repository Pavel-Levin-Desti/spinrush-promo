/**
 * ab.js — SpinRush A/B testing utility
 *
 * getVariant(testName, variants)        → string
 * trackVariant(testName, variant)       → void
 * applyVariant(testName, variants)      → string
 */

const AB_STORAGE_PREFIX = 'spinrush_ab_';

/**
 * Assigns the current user to a variant for a named test.
 * Assignment is random on first visit and then persisted in localStorage
 * so the same user always sees the same variant.
 *
 * @param {string}   testName - Unique identifier for this test, e.g. "cta-copy".
 * @param {string[]} variants - Array of variant names, e.g. ["control", "challenger"].
 *                              Any number of variants is supported; each gets equal weight.
 * @returns {string} The assigned variant name.
 *
 * @example
 * getVariant('cta-copy', ['control', 'challenger']);
 * // → 'control'  (persisted in localStorage on first call, same result on reload)
 */
function getVariant(testName, variants) {
  if (!testName || typeof testName !== 'string') {
    throw new TypeError('getVariant: testName must be a non-empty string.');
  }
  if (!Array.isArray(variants) || variants.length < 2) {
    throw new TypeError('getVariant: variants must be an array with at least 2 entries.');
  }

  const storageKey = AB_STORAGE_PREFIX + testName;

  // Return persisted assignment if it still matches a known variant
  const stored = localStorage.getItem(storageKey);
  if (stored !== null && variants.includes(stored)) {
    return stored;
  }

  // Assign randomly with equal weight
  const assigned = variants[Math.floor(Math.random() * variants.length)];
  try {
    localStorage.setItem(storageKey, assigned);
  } catch (_) {
    // localStorage may be unavailable (private mode quota, etc.) — degrade silently
  }

  return assigned;
}

/**
 * Logs the test assignment to the console.
 * In a real project, replace the console.log with an analytics call
 * (e.g. window.analytics.track, gtag, segment, etc.).
 *
 * @param {string} testName - Test identifier.
 * @param {string} variant  - Variant the user was assigned to.
 *
 * @example
 * trackVariant('cta-copy', 'challenger');
 * // console → { test: 'cta-copy', variant: 'challenger', timestamp: '2025-…' }
 */
function trackVariant(testName, variant) {
  if (!testName || typeof testName !== 'string') {
    throw new TypeError('trackVariant: testName must be a non-empty string.');
  }
  if (!variant || typeof variant !== 'string') {
    throw new TypeError('trackVariant: variant must be a non-empty string.');
  }

  const payload = {
    test:      testName,
    variant:   variant,
    timestamp: new Date().toISOString(),
  };

  console.log('[A/B]', payload);

  // TODO: replace with real analytics call, e.g.:
  // window.analytics?.track('AB Test Assigned', payload);
  // gtag('event', 'ab_assignment', payload);
}

/**
 * Orchestrates the full A/B flow:
 *   1. Calls getVariant to get (or reuse) the user's assignment.
 *   2. Calls trackVariant to fire the analytics event.
 *   3. Finds all elements with [data-ab="testName"] in the document,
 *      shows the one whose [data-variant] matches the assignment,
 *      and hides all others (display:none).
 *
 * Safe to call before DOMContentLoaded if elements are already parsed,
 * or after — element visibility is set at call time.
 *
 * @param {string}   testName - Test identifier; must match data-ab attributes in the DOM.
 * @param {string[]} variants - Array of variant names.
 * @returns {string} The assigned variant name (useful for further conditional logic).
 *
 * @example
 * // HTML: <div data-ab="cta-copy" data-variant="control">…</div>
 * //       <div data-ab="cta-copy" data-variant="challenger">…</div>
 * applyVariant('cta-copy', ['control', 'challenger']);
 * // Shows matching element, hides the other.
 */
function applyVariant(testName, variants) {
  const variant = getVariant(testName, variants);
  trackVariant(testName, variant);

  const candidates = document.querySelectorAll('[data-ab="' + testName + '"]');

  candidates.forEach(function (el) {
    if (el.dataset.variant === variant) {
      el.style.display = '';   // restore default display
    } else {
      el.style.display = 'none';
    }
  });

  return variant;
}
