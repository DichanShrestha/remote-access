import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

type PageLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

/** Use Next navigation for page URLs while retaining native hash and off-site links. */
export function PageLink({ href, children, download, ...props }: PageLinkProps) {
  const isNativeLink = Boolean(download)
    || href === ''
    || href.startsWith('#')
    || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href);

  if (isNativeLink) {
    return <a href={href} download={download} {...props}>{children}</a>;
  }

  return <Link href={href} download={download} {...props}>{children}</Link>;
}
