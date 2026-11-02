import type { ImgHTMLAttributes } from 'react';

type PageImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** Approximate rendered width at common viewport sizes. */
  sizes?: string;
};

function getUnsplashSrcSet(src: string): string | undefined {
  try {
    const url = new URL(src);
    if (url.hostname !== 'images.unsplash.com') return undefined;

    return [480, 768, 1200, 1600, 2000]
      .map((width) => {
        const candidate = new URL(url);
        candidate.searchParams.set('auto', 'format');
        candidate.searchParams.set('fit', candidate.searchParams.get('fit') || 'crop');
        candidate.searchParams.set('w', String(width));
        candidate.searchParams.set('q', candidate.searchParams.get('q') || '80');
        return `${candidate.toString()} ${width}w`;
      })
      .join(', ');
  } catch {
    return undefined;
  }
}

/** Responsive, low-priority by default media for published Pageory pages. */
export function PageImage({
  src,
  alt,
  sizes = '(max-width: 768px) 100vw, 50vw',
  loading,
  decoding,
  fetchPriority,
  ...props
}: PageImageProps) {
  const source = typeof src === 'string' ? src : undefined;
  const priority = fetchPriority === 'high';

  return (
    // User uploaded images may be on arbitrary hosts, so retain native img and
    // add a responsive source set for the Unsplash assets used by the starter sites.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={src}
      width={props.width || 1200}
      height={props.height || 800}
      srcSet={source ? getUnsplashSrcSet(source) : undefined}
      sizes={sizes}
      alt={alt ?? ''}
      loading={loading || (priority ? 'eager' : 'lazy')}
      decoding={decoding || 'async'}
      fetchPriority={fetchPriority || 'auto'}
    />
  );
}
