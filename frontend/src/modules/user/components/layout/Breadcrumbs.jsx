import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Breadcrumbs() {
    const location = useLocation()
    const pathnames = location.pathname.split('/').filter((x) => x)

    if (pathnames.length === 0) return null

    return (
        <nav className="hidden md:flex items-center gap-2 py-4 text-[13px] text-slate-400 font-medium">
            <Link
                to="/home"
                className="flex items-center gap-1 hover:text-primary transition-colors"
            >
                <Home size={14} />
                <span>Home</span>
            </Link>

            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1
                const to = `/${pathnames.slice(0, index + 1).join('/')}`

                // Don't show numeric IDs in breadcrumbs if possible, or format them
                const isId = !isNaN(value)
                const label = isId ? 'Details' : value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')

                if (value === 'home') return null

                return (
                    <div key={to} className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-slate-300" />
                        {last ? (
                            <span className="text-slate-900 font-semibold">{label}</span>
                        ) : (
                            <Link
                                to={to}
                                className="hover:text-primary transition-colors capitalize"
                            >
                                {label}
                            </Link>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
