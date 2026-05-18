/**
 * utm.js — SpinRush UTM utility
 *
 * buildUTM(baseUrl, params)   → string
 * getUTMFromURL(url?)          → object
 * appendUTMToLinks(params)    → void
 */

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
];

/**
 * Builds a URL with UTM query parameters appended.
 *
 * @param {string} baseUrl   - The destination URL (may already have a query string).
 * @param {Object} params    - Key/value pairs of UTM parameters to append.
 *                             Non-UTM keys are included as-is.
 * @returns {string}         - The full URL with UTM params in the query string.
 *
 * @example
 * buildUTM('https://spinrush.com/promo', {
 *   utm_source: 'email',
 *   utm_medium: 'cpc',
 *   utm_campaign: 'welcome-bonus',
 * });
 * // → 'https://spinrush.com/promo?utm_source=email&utm_medium=cpc&utm_campaign=welcome-bonus'
 */
function buildUTM(baseUrl, params) {
  if (!baseUrl || typeof baseUrl !== 'string') {
    throw new TypeError('buildUTM: baseUrl must be a non-empty string.');
  }
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    throw new TypeError('buildUTM: params must be a plain object.');
  }

  const url = new URL(baseUrl, window.location.href);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

/**
 * Reads UTM parameters from a URL string (defaults to the current page URL).
 *
 * @param {string} [url=window.location.href] - URL to parse. Defaults to current page.
 * @returns {Object} - Object containing only the UTM keys that were present.
 *
 * @example
 * // Page URL: https://spinrush.com/?utm_source=email&utm_campaign=welcome-bonus
 * getUTMFromURL();
 * // → { utm_source: 'email', utm_campaign: 'welcome-bonus' }
 */
function getUTMFromURL(url) {
  const target = url || window.location.href;
  const searchParams = new URL(target, window.location.href).searchParams;
  const found = {};

  UTM_KEYS.forEach((key) => {
    const value = searchParams.get(key);
    if (value !== null) {
      found[key] = value;
    }
  });

  return found;
}

/**
 * Finds all <a> elements with data-track="true" and appends UTM params
 * to their href attributes. Skips anchors without an href or with
 * href="#" / mailto: / tel: schemes.
 *
 * @param {Object} params - UTM key/value pairs to append.
 * @returns {number}      - Count of links that were updated.
 *
 * @example
 * appendUTMToLinks({ utm_source: 'email', utm_medium: 'cpc' });
 * // All <a data-track="true"> hrefs now carry those params.
 */
function appendUTMToLinks(params) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    throw new TypeError('appendUTMToLinks: params must be a plain object.');
  }

  const links = document.querySelectorAll('a[data-track="true"]');
  let updatedCount = 0;

  links.forEach((anchor) => {
    const href = anchor.getAttribute('href');

    // Skip empty, hash-only, mailto, and tel links
    if (
      !href ||
      href === '#' ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return;
    }

    try {
      anchor.href = buildUTM(href, params);
      updatedCount++;
    } catch (_) {
      // Leave malformed hrefs untouched
    }
  });

  return updatedCount;
}
