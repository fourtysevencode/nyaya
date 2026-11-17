import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/fir-analysis', label: 'FIR Analysis' },
  { to: '/section-finder', label: 'Section Finder' },
  { to: '/timeline-generator', label: 'Timeline' },
  { to: '/know-your-rights', label: 'Your Rights' },
  { to: '/complaint-drafter', label: 'Draft a Letter' },
]

export default function Layout() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  // Wayfinding: every page starts at the top, like turning a page.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Scroll edge effect: the material's bottom fade only appears once content
  // actually scrolls underneath it (never while it floats over nothing).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={scrolled ? 'scrolled' : ''}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo" aria-label="Nyaya — home">
            <img
              src="/favicon/android-chrome-192x192.png"
              alt=""
              width="34"
              height="34"
            />
          </Link>
          <div className="nav-links">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}>
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  )
}
