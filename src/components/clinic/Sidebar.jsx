import { NavLink } from 'react-router-dom'
import { CLINIC_NAV_ITEMS } from '../../constants/clinicNav'

function navLinkClass({ isActive }) {
  return [
    'block rounded-lg px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-emerald-600 text-white'
      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800',
  ].join(' ')
}

function Sidebar({ onNavigate }) {
  const handleClick = () => {
    onNavigate?.()
  }

  return (
    <nav aria-label="Menu do portal da clínica" className="flex flex-col gap-1 p-4">
      {CLINIC_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={navLinkClass}
          onClick={handleClick}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default Sidebar
