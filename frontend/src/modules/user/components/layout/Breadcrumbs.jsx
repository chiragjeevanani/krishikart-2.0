import { useState, useEffect } from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Breadcrumbs() {
    const location = useLocation()
    const [productName, setProductName] = useState(localStorage.getItem('kk_last_viewed_product_name') || '')

    useEffect(() => {
        const handleUpdate = () => {
            setProductName(localStorage.getItem('kk_last_viewed_product_name') || '')
        }
        window.addEventListener('kk_product_name_updated', handleUpdate)
        return () => window.removeEventListener('kk_product_name_updated', handleUpdate)
    }, [])

    const pathnames = location.pathname.split('/').filter((x) => x && !/^[0-9a-fA-F]{24}$/.test(x))

    if (pathnames.length === 0) return null

    // If we are on a product detail page, append the product name to pathnames for display
    const isProductDetail = location.pathname.startsWith('/product/') && productName
    const displayPathnames = isProductDetail ? [...pathnames, productName] : pathnames

    return (
        <nav className="hidden md:flex items-center gap-2 py-2 text-[13px] text-slate-400 font-medium">
            <Link
                to="/home"
                className="flex items-center gap-1 hover:text-primary transition-colors"
            >
                <Home size={14} />
                <span>Home</span>
            </Link>

            {displayPathnames.map((value, index) => {
                const isCustomLabel = isProductDetail && index === displayPathnames.length - 1
                const last = index === displayPathnames.length - 1
                
                // Construct 'to' path correctly - for custom label, it shouldn't have its own link or should link to current
                const to = isCustomLabel 
                    ? location.pathname 
                    : `/${displayPathnames.slice(0, index + 1).join('/')}`

                const label = isCustomLabel 
                    ? value 
                    : value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')

                if (value === 'home') return null

                return (
                    <div key={to} className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-slate-300" />
                        {last ? (
                            <span className="text-slate-900 font-semibold truncate max-w-[200px]">{label}</span>
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
