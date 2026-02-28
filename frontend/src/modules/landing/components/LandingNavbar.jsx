import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Menu, X } from 'lucide-react';

export default function LandingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className={`landing-navbar ${isScrolled ? 'scrolled' : ''}`}>
            <Link to="/" className="landing-logo">
                <div className="bg-primary p-1.5 rounded-xl">
                    <Sprout className="text-white" size={24} />
                </div>
                <span>Krishi<span className="text-primary-light">Kart</span></span>
            </Link>

            <div className="landing-nav-links">
                <a href="#about" className="landing-nav-link">About</a>
                <a href="#categories" className="landing-nav-link">Categories</a>
                <a href="#how-it-works" className="landing-nav-link">How it Works</a>
                <Link to="/login" className="landing-cta-button">Login / Signup</Link>
            </div>

            <button className="md:hidden text-primary" onClick={toggleMenu}>
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-xl p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top duration-300">
                    <a href="#about" className="landing-nav-link text-lg py-2" onClick={toggleMenu}>About</a>
                    <a href="#categories" className="landing-nav-link text-lg py-2" onClick={toggleMenu}>Categories</a>
                    <a href="#how-it-works" className="landing-nav-link text-lg py-2" onClick={toggleMenu}>How it Works</a>
                    <Link to="/login" className="landing-cta-button text-center mt-2" onClick={toggleMenu}>Login / Signup</Link>
                </div>
            )}
        </nav>
    );
}
