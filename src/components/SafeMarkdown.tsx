import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

/**
 * SECURITY: SafeMarkdown component wraps ReactMarkdown with secure defaults
 * - Disallows raw HTML (default in react-markdown v10+)
 * - Sanitizes links to prevent javascript: protocol
 * - Only allows safe href protocols
 */

interface SafeMarkdownProps {
  children: string;
  className?: string;
}

// SECURITY: Only allow safe URL protocols
const SAFE_URL_PROTOCOLS = ["http:", "https:", "mailto:"];

function isSafeUrl(url: string | undefined): boolean {
  if (!url) return true;

  try {
    const parsed = new URL(url, "https://example.com");
    return SAFE_URL_PROTOCOLS.includes(parsed.protocol);
  } catch {
    // If URL parsing fails, check for javascript: prefix manually
    return !url.toLowerCase().trim().startsWith("javascript:");
  }
}

// SECURITY: Custom components to sanitize potentially dangerous elements
const secureComponents: Components = {
  // Sanitize links to prevent javascript: protocol attacks
  a: ({ href, children, ...props }) => {
    if (!isSafeUrl(href)) {
      // Return just the text content without the link if URL is unsafe
      return <span>{children}</span>;
    }
    return (
      <a
        href={href}
        {...props}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },
  // Remove script tags entirely (shouldn't be present, but extra safety)
  script: () => null,
  // Remove style tags entirely
  style: () => null,
  // Remove iframe tags entirely
  iframe: () => null,
  // Remove object/embed tags
  object: () => null,
  embed: () => null,
  // Sanitize images to only allow safe src
  img: ({ src, alt, ...props }) => {
    if (!isSafeUrl(src)) {
      return null;
    }
    return <img src={src} alt={alt || ""} {...props} />;
  },
};

export function SafeMarkdown({ children, className }: SafeMarkdownProps) {
  // SECURITY: Skip rendering if content is empty or not a string
  if (!children || typeof children !== "string") {
    return null;
  }

  return (
    <div className={className}>
      <ReactMarkdown
        components={secureComponents}
        // SECURITY: react-markdown v10+ disallows raw HTML by default
        // This is explicit for clarity and documentation
        skipHtml={true}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default SafeMarkdown;
