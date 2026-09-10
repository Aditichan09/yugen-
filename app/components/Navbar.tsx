import Link from 'next/link';

const navStyle = {
  color: '#9ca3af',
  textDecoration: 'none',
  fontSize: '13px',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export default function Navbar() {
  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '28px',
        padding: '16px 0',
        marginBottom: '32px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Link href="/" style={navStyle}>Translate</Link>
      <Link href="/about" style={navStyle}>About</Link>
      <Link href="/privacy" style={navStyle}>Privacy</Link>
      <Link href="/terms" style={navStyle}>Terms</Link>
      <Link href="/security" style={navStyle}>Security</Link>
    </nav>
  );
}