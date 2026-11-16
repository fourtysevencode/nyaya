import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/fir-analysis', label: 'FIR Analysis' },
  { to: '/section-finder', label: 'Section Finder' },
  { to: '/timeline-generator', label: 'Timeline' },
]

export default function Layout({ children }) {
  return (
    <>
      <nav>
        <img
          src="/favicon/android-chrome-192x192.png"
          alt="Nyaya logo"
          width="50"
          height="50"
          id="logo"
        />
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {label}
          </NavLink>
        ))}
      </nav>
      {children}
    </>
  )
}
