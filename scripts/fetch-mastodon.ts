#!/usr/bin/env node

/**
 * Build-time Mastodon ingestion.
 *
 * Retrieves the group's most recent public statuses and caches them at
 * `src/data/mastodon-posts.json` so the site can render them without any
 * browser-side API call.
 *
 * Requires Node 22.18+ so that this TypeScript file runs directly under native
 * type stripping. Run it through `npm run fetch-mastodon`, which also loads
 * `.env` when one is present.
 *
 * Behaviour contract:
 * - `MASTODON_POST_LIMIT` is validated first, before anything else, so a bad
 *   value always fails loudly regardless of whether an account is configured.
 * - An absent or blank `MASTODON_ACCOUNT` means "feed not configured". That is a
 *   success, not an error, and it never overwrites an existing cache.
 * - A configured account that fails to fetch is an error, and the existing cache
 *   is left untouched rather than replaced with partial or empty data.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Type-only import: erased before Node executes this file, so there is no
// runtime dependency on the site's source tree.
import type { MastodonPost } from '../src/types/mastodon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_POST_LIMIT = 20;
const MIN_POST_LIMIT = 1;
const MAX_POST_LIMIT = 40;
const REQUEST_TIMEOUT_MS = 15_000;
const USER_AGENT = 'Community-Food-Group-Build/1.0';
const MEDIA_TYPES = ['image', 'video', 'gifv', 'audio'] as const;

type MediaType = (typeof MEDIA_TYPES)[number];

interface AccountHandle {
  username: string;
  instance: string;
}

interface AccountLookup {
  id: string;
  display_name?: string;
  avatar?: string;
  avatar_static?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asCount(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asMediaType(value: unknown): MediaType | undefined {
  return MEDIA_TYPES.find((type) => type === value);
}

/**
 * Resolve and validate the post limit.
 *
 * Deliberately called before the "is the feed configured?" check so that an
 * invalid limit fails even when no account is set.
 */
export function resolvePostLimit(raw: string | undefined): number {
  const trimmed = raw?.trim() ?? '';

  if (trimmed === '') {
    return DEFAULT_POST_LIMIT;
  }

  if (!/^[+-]?\d+$/.test(trimmed)) {
    throw new Error(`MASTODON_POST_LIMIT must be a whole number, received "${raw}".`);
  }

  const limit = Number.parseInt(trimmed, 10);

  if (limit < MIN_POST_LIMIT || limit > MAX_POST_LIMIT) {
    throw new Error(
      `MASTODON_POST_LIMIT must be between ${MIN_POST_LIMIT} and ${MAX_POST_LIMIT}, received ${limit}.`
    );
  }

  return limit;
}

/**
 * Parse `user@instance` or `@user@instance` into its parts.
 *
 * Both halves are validated against a strict character set because they are
 * interpolated into a request URL.
 */
export function parseAccountHandle(handle: string): AccountHandle {
  const cleaned = handle.trim().replace(/^@/, '');
  const parts = cleaned.split('@');

  if (parts.length !== 2) {
    throw new Error(
      `Invalid Mastodon handle "${handle}". Expected the form user@instance.example.`
    );
  }

  const [username, instance] = parts;

  if (username === undefined || !/^[A-Za-z0-9_]+$/.test(username)) {
    throw new Error(
      `Invalid Mastodon username in "${handle}". Usernames may contain only letters, digits and underscores.`
    );
  }

  if (instance === undefined || !/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(instance)) {
    throw new Error(
      `Invalid Mastodon instance in "${handle}". Expected a hostname such as mastodon.social.`
    );
  }

  return { username, instance };
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText} from ${url}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function lookupAccount({ username, instance }: AccountHandle): Promise<AccountLookup> {
  const url = `https://${instance}/api/v1/accounts/lookup?acct=${encodeURIComponent(username)}`;
  const payload = await fetchJson(url);

  if (!isRecord(payload)) {
    throw new Error(`Unexpected account response from ${instance}.`);
  }

  const id = asString(payload.id);

  if (id === undefined) {
    throw new Error(`Account "${username}@${instance}" was not found.`);
  }

  return {
    id,
    display_name: asString(payload.display_name),
    avatar: asString(payload.avatar),
    avatar_static: asString(payload.avatar_static),
  };
}

/**
 * Convert one untrusted status object into our own shape.
 *
 * Returns undefined for anything missing the fields the site relies on, so a
 * single malformed status cannot break the whole build.
 */
function toPost(
  value: unknown,
  account: AccountLookup,
  handle: AccountHandle
): MastodonPost | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = asString(value.id);
  const createdAt = asString(value.created_at);
  const content = asString(value.content);

  if (id === undefined || createdAt === undefined || content === undefined) {
    return undefined;
  }

  const statusAccount = isRecord(value.account) ? value.account : {};
  const rawMedia = Array.isArray(value.media_attachments) ? value.media_attachments : [];

  const media = rawMedia.flatMap((item: unknown) => {
    if (!isRecord(item)) {
      return [];
    }

    const mediaId = asString(item.id);
    const type = asMediaType(item.type);
    const url = asString(item.url);

    if (mediaId === undefined || type === undefined || url === undefined) {
      return [];
    }

    return [
      {
        id: mediaId,
        type,
        url,
        preview_url: asString(item.preview_url),
        description: asString(item.description),
      },
    ];
  });

  return {
    id,
    created_at: createdAt,
    content,
    url: asString(value.url) ?? asString(value.uri),
    account: {
      id: asString(statusAccount.id) ?? account.id,
      username: asString(statusAccount.username) ?? handle.username,
      display_name: asString(statusAccount.display_name) ?? account.display_name,
      avatar: asString(statusAccount.avatar) ?? account.avatar,
      avatar_static: asString(statusAccount.avatar_static) ?? account.avatar_static,
    },
    media_attachments: media,
    replies_count: asCount(value.replies_count) ?? 0,
    reblogs_count: asCount(value.reblogs_count) ?? 0,
    favourites_count: asCount(value.favourites_count) ?? 0,
  };
}

export async function fetchMastodonPosts(
  handle: AccountHandle,
  limit: number
): Promise<MastodonPost[]> {
  const account = await lookupAccount(handle);
  const url =
    `https://${handle.instance}/api/v1/accounts/${encodeURIComponent(account.id)}/statuses` +
    `?limit=${limit}&exclude_replies=true&exclude_reblogs=true`;

  const payload = await fetchJson(url);

  if (!Array.isArray(payload)) {
    throw new Error(`Unexpected statuses response from ${handle.instance}.`);
  }

  return payload.flatMap((status: unknown) => {
    const post = toPost(status, account, handle);
    return post === undefined ? [] : [post];
  });
}

export function writePostsToFile(posts: MastodonPost[], outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(posts, null, 2)}\n`, 'utf-8');
}

async function main(): Promise<void> {
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'mastodon-posts.json');

  // Validated first, unconditionally: a bad limit is a configuration error even
  // when there is no account to fetch.
  const limit = resolvePostLimit(process.env.MASTODON_POST_LIMIT);

  const rawAccount = process.env.MASTODON_ACCOUNT?.trim() ?? '';

  if (rawAccount === '') {
    console.log('MASTODON_ACCOUNT is not set; skipping the Mastodon feed.');

    if (fs.existsSync(outputPath)) {
      console.log(`Existing cache left unchanged at ${outputPath}`);
    } else {
      // Only ever written when no cache exists, so a fresh clone can build.
      writePostsToFile([], outputPath);
      console.log(`Wrote an empty cache to ${outputPath}`);
    }

    return;
  }

  const handle = parseAccountHandle(rawAccount);

  console.log(`Fetching up to ${limit} posts from @${handle.username}@${handle.instance}...`);

  const posts = await fetchMastodonPosts(handle, limit);

  writePostsToFile(posts, outputPath);
  console.log(`Cached ${posts.length} post(s) to ${outputPath}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    await main();
  } catch (error) {
    console.error(
      `Mastodon fetch failed: ${error instanceof Error ? error.message : String(error)}`
    );
    console.error('The existing cache was left unchanged.');
    process.exitCode = 1;
  }
}
