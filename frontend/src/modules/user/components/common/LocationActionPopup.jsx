import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api'
import { ArrowLeft, Crosshair, MapPin, Search, X } from 'lucide-react'
import { geocodeAddressFrontend } from '@/lib/geo'
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_LOADER_ID } from '@/lib/mapsConfig'

export default function LocationActionPopup({
    isOpen,
    loading = false,
    onClose,
    onUseCurrentLocation,
    onManualLocationSelect,
}) {
    const [manualMode, setManualMode] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [autocomplete, setAutocomplete] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { isLoaded } = useJsApiLoader({
        id: GOOGLE_MAPS_LOADER_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES,
    })

    if (!isOpen) return null

    const handleClose = () => {
        setManualMode(false)
        setSearchValue('')
        setAutocomplete(null)
        setIsSubmitting(false)
        onClose?.()
    }

    const handleManualSubmit = async (event) => {
        event.preventDefault()
        const query = searchValue.trim()
        if (!query || typeof onManualLocationSelect !== 'function') return

        try {
            setIsSubmitting(true)
            const coords = await geocodeAddressFrontend(query)
            if (!coords) return
            await onManualLocationSelect({
                lat: coords.lat,
                lng: coords.lng,
                address: query,
            })
            handleClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePlaceChanged = async () => {
        if (!autocomplete || typeof onManualLocationSelect !== 'function') return
        const place = autocomplete.getPlace()
        if (!place?.geometry?.location) return

        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        const address =
            place.formatted_address ||
            place.name ||
            searchValue.trim()

        setIsSubmitting(true)
        try {
            await onManualLocationSelect({ lat, lng, address })
            handleClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 p-4 md:items-center">
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.98 }}
                    className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl"
                >
                    <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                                Set Location
                            </p>
                            <h2 className="mt-1 text-lg font-black text-slate-900">
                                {manualMode ? 'Enter your location' : 'Choose how you want to set your location'}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="space-y-3 p-5">
                        {manualMode ? (
                            <>
                                <form onSubmit={handleManualSubmit} className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        {isLoaded ? (
                                            <Autocomplete
                                                onLoad={setAutocomplete}
                                                onPlaceChanged={handlePlaceChanged}
                                            >
                                                <input
                                                    type="text"
                                                    value={searchValue}
                                                    onChange={(e) => setSearchValue(e.target.value)}
                                                    placeholder="Search location"
                                                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                                />
                                            </Autocomplete>
                                        ) : (
                                            <input
                                                type="text"
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                                placeholder="Search location"
                                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                            />
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !searchValue.trim()}
                                        className="h-12 w-full rounded-2xl bg-emerald-500 text-sm font-black text-white disabled:opacity-60"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save location'}
                                    </button>
                                </form>
                                <button
                                    type="button"
                                    onClick={() => setManualMode(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"
                                >
                                    <ArrowLeft size={16} />
                                    Back
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={onUseCurrentLocation}
                                    disabled={loading}
                                    className="flex w-full items-center gap-3 rounded-[22px] border border-emerald-100 bg-emerald-50 px-4 py-4 text-left transition-all active:scale-[0.99] disabled:opacity-60"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white">
                                        <Crosshair size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">
                                            {loading ? 'Fetching location...' : 'Use current location'}
                                        </p>
                                        <p className="text-xs font-medium text-slate-500">
                                            Detect your live location automatically
                                        </p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setManualMode(true)}
                                    className="flex w-full items-center gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-left transition-all active:scale-[0.99]"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Enter manually</p>
                                        <p className="text-xs font-medium text-slate-500">
                                            Search and choose a location yourself
                                        </p>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
