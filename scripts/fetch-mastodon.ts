#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MastodonPost {
  id: string;
  created_at: string;
  content: string;
  url?: string;
  account?: {
    id: string;
    username: string;
    display_name?: string;
    avatar?: string;
    avatar_static?: string;
  };
  media_attachments?: Array<{
    id: string;
    type: 'image' | 'video' | 'gifv' | 'audio';
    url: string;
    preview_url?: string;
    description?: string;
  }>;
  replies_count?: number;
  reblogs_count?: number;
  favourites_count?: number;
  reblog?: MastodonPost;
}

interface FetchConfig {
  instance: string;
  username: string;
  limit: number;
}

/**
 * Parse Mastodon account handle (e.g., @username@instance.com or username@instance.com)
 * Returns { instance, username }
 */
function parseAccountHandle(handle: string): { instance: string; username: string } {
  // Remove @ if present at start
  const cleanHandle = handle.replace(/^@/, '');
  const parts = cleanHandle.split('@');

  if (parts.length !== 2) {
    throw new Error(
      `Invalid Mastodon account handle format: "${handle}". Expected format: username@instance.com or @username@instance.com`
    );
  }

  return {
    username: parts[0],
    instance: parts[1],
  };
}

/**
 * Fetch Mastodon posts from a given account
 */
async function fetchMastodonPosts(config: FetchConfig): Promise<MastodonPost[]> {
  const { instance, username, limit } = config;

  try {
    // First, get the account ID
    const accountResponse = await fetch(
      `https://${instance}/api/v1/accounts/lookup?acct=${username}`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Community-Food-Group-Build/1.0',
        },
      }
    );

    if (!accountResponse.ok) {
      throw new Error(
        `Failed to fetch account: ${accountResponse.status} ${accountResponse.statusText}`
      );
    }

    const accountData = await accountResponse.json();

    if (!accountData.id) {
      throw new Error('Account not found');
    }

    // Fetch the latest posts
    const postsResponse = await fetch(
      `https://${instance}/api/v1/accounts/${accountData.id}/statuses?limit=${limit}&exclude_replies=true&exclude_reblogs=true`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Community-Food-Group-Build/1.0',
        },
      }
    );

    if (!postsResponse.ok) {
      throw new Error(
        `Failed to fetch posts: ${postsResponse.status} ${postsResponse.statusText}`
      );
    }

    const posts = await postsResponse.json();

    // Transform the data to ensure consistency
    return posts.map((post: any) => {
      const content = post.content || '';

      return {
        id: post.id,
        created_at: post.created_at,
        content: content,
        url: post.url || post.uri,
        account: {
          id: post.account?.id || accountData.id,
          username: post.account?.username || username,
          display_name: post.account?.display_name || accountData.display_name,
          avatar: post.account?.avatar || accountData.avatar,
          avatar_static: post.account?.avatar_static || accountData.avatar_static,
        },
        media_attachments: post.media_attachments?.map((media: any) => ({
          id: media.id,
          type: media.type,
          url: media.url,
          preview_url: media.preview_url,
          description: media.description,
        })) || [],
        replies_count: post.replies_count || 0,
        reblogs_count: post.reblogs_count || 0,
        favourites_count: post.favourites_count || 0,
        reblog: post.reblog,
      };
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Mastodon posts: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Write posts to JSON file
 */
function writePostsToFile(posts: MastodonPost[], outputPath: string): void {
  const dirPath = path.dirname(outputPath);

  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Write with pretty formatting
  fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), 'utf-8');
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const dataDir = path.join(__dirname, '../src/data');
  const outputPath = path.join(dataDir, 'mastodon-posts.json');

  // Get configuration from environment or use defaults
  const accountHandle = process.env.MASTODON_ACCOUNT || '@communityfood@mastodon.social';
  const postLimit = parseInt(process.env.MASTODON_POST_LIMIT || '20', 10);

  console.log(`Fetching ${postLimit} posts from ${accountHandle}...`);

  try {
    // Parse the account handle
    const { instance, username } = parseAccountHandle(accountHandle);

    // Fetch posts
    const posts = await fetchMastodonPosts({
      instance,
      username,
      limit: postLimit,
    });

    console.log(`✅ Successfully fetched ${posts.length} posts`);

    // Write to file
    writePostsToFile(posts, outputPath);
    console.log(`✅ Posts written to ${outputPath}`);

    // Exit with success
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fetchMastodonPosts, parseAccountHandle, writePostsToFile };