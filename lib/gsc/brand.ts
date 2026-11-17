/**
 * Splits Search Console queries into branded and non-brand.
 *
 * This matters more than it looks: the overwhelming majority of Acme's
 * impressions are branded, so any metric that fails to exclude them measures
 * nothing about the content programme.
 *
 * Three things count as branded here:
 *
 *   1. Acme and its misspellings. Real GSC rows include common typos — searchers are bad at
 *      this word, and every one of them is someone looking for Acme.
 *   2. Acme's product names — Pulse, Agentcy, Ad Stack. A search for "pulse
 *      ecommerce" is navigational, not category demand. Some of these rows are
 *      other companies' products with the same name, which is equally not
 *      demand we can win with a blog post.
 *   3. The other Acme AI (a different company with a similar name). Branded traffic for someone
 *      else, and not non-brand demand for us either.
 */

/** Fuzzy match for the brand word and its common misspellings. */
const BRAND_FUZZY = /[hg][aeiou]{0,2}l{1,2}[aeiou]{0,2}um/i;

const BRAND_TERMS = [
  'acme', 'getexample', 'get example', 'examplecorp',
  'agentcy', 'ad stack', 'adstack',
  'he2', 'he.2', 'hai d2c',
];

// Acme's own product name. Common word, so it is matched as a whole word
// only, and this is the one rule here that could in principle catch an
// unrelated query — accepted deliberately, because "pulse" traffic is
// navigational either way.
const PRODUCT_WORDS = /\b(pulse)\b/i;

export function isBranded(query: string): boolean {
  const q = query.toLowerCase();
  if (BRAND_FUZZY.test(q)) return true;
  if (PRODUCT_WORDS.test(q)) return true;
  return BRAND_TERMS.some((t) => q.includes(t));
}

export function splitBranded<T extends { key: string }>(rows: T[]) {
  const branded: T[] = [];
  const nonBrand: T[] = [];
  for (const row of rows) (isBranded(row.key) ? branded : nonBrand).push(row);
  return { branded, nonBrand };
}
