/**
 * Shared video embed normalisation for page sections and blog articles.
 * Pure, dependency-free and safe to use on the client or the server.
 */

const VIDEO_FILE_PATTERN = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

export function formatVideoEmbedUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Direct video file
  if (VIDEO_FILE_PATTERN.test(trimmed)) {
    return trimmed;
  }

  try {
    const urlString = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

    // YouTube formats: watch, embed, shorts, live, youtu.be
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com' || hostname === 'youtu.be') {
      let videoId = '';
      const t = parsed.searchParams.get('t') || parsed.searchParams.get('start');

      if (hostname === 'youtu.be') {
        videoId = parsed.pathname.replace(/^\//, '').split('/')[0];
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.replace(/^\/embed\//, '').split('/')[0];
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.replace(/^\/shorts\//, '').split('/')[0];
      } else if (parsed.pathname.startsWith('/live/')) {
        videoId = parsed.pathname.replace(/^\/live\//, '').split('/')[0];
      } else {
        videoId = parsed.searchParams.get('v') || '';
      }

      if (videoId) {
        videoId = videoId.split('&')[0].split('?')[0].trim();
        const params = new URLSearchParams();
        params.set('rel', '0');
        if (t) {
          const matchTime = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?/i);
          if (matchTime) {
            const hours = parseInt(matchTime[1] || '0', 10);
            const mins = parseInt(matchTime[2] || '0', 10);
            const secs = parseInt(matchTime[3] || '0', 10);
            const total = hours * 3600 + mins * 60 + secs;
            if (total > 0) params.set('start', total.toString());
          } else {
            params.set('start', t.replace('s', ''));
          }
        }
        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      }
    }

    // Vimeo
    if (hostname.includes('vimeo.com')) {
      const match = parsed.pathname.match(/\/(\d+)/);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    }

    // Loom
    if (hostname.includes('loom.com')) {
      if (parsed.pathname.includes('/share/')) {
        return parsed.toString().replace('/share/', '/embed/');
      }
    }

    // Spotify already provides a dedicated embed URL.
    if (hostname === 'open.spotify.com') {
      if (parsed.pathname.startsWith('/embed/')) return parsed.toString();
      return `https://open.spotify.com/embed${parsed.pathname}`;
    }
  } catch {}

  // Fallback regex if URL parsing didn't catch it
  const ytRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([^"&?/\s]+)/i;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
  }

  return trimmed;
}

export function isDirectVideoFile(url: string): boolean {
  return VIDEO_FILE_PATTERN.test(url);
}

const ALLOWED_EMBED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
  'www.vimeo.com',
  'loom.com',
  'www.loom.com',
  'open.spotify.com',
  'w.soundcloud.com',
  'player.soundcloud.com',
]);

export function isAllowedVideoEmbedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    return ALLOWED_EMBED_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Build editor-safe markup for a pasted video URL. Only recognised providers
 * are embedded; anything else is returned as a plain link by `null`.
 */
export function buildVideoEmbedMarkup(rawUrl: string): { html: string } | { error: string } {
  const formatted = formatVideoEmbedUrl(rawUrl);
  if (!formatted) return { error: 'Enter a video URL.' };

  if (isDirectVideoFile(formatted)) {
    if (!/^https?:\/\//i.test(formatted)) {
      return { error: 'Use a secure https:// video URL.' };
    }
    return {
      html: `<video controls preload="metadata" src="${escapeAttribute(formatted)}"></video>`,
    };
  }

  if (!isAllowedVideoEmbedUrl(formatted)) {
    return { error: 'Use a YouTube, Vimeo, Loom or Spotify embed URL.' };
  }

  return {
    html: `<iframe src="${escapeAttribute(formatted)}" title="Embedded video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
  };
}
