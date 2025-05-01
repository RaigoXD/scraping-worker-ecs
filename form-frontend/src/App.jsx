import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import FormView from './views/FormView'
import DashboardView from './views/DashboardView'

function App() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close menu when clicking outside on mobile
  useEffect(() => {
    if (isMobileMenuOpen) {
      const handleOutsideClick = (e) => {
        if (!e.target.closest('.navbar-menu') && !e.target.closest('.mobile-menu-toggle')) {
          setIsMobileMenuOpen(false);
        }
      };
      
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="navbar-container">
          {/* Logo/Brand */}
          <div className="navbar-brand">
            <span>La Fiestica</span>
          </div>
          
          {/* Navigation Links */}
          <nav className={`navbar-menu ${isMobileMenuOpen ? 'is-active' : ''}`}>
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              Formulario
            </NavLink>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard
            </NavLink>
          </nav>
          
          {/* Mobile menu toggle */}
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'is-active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<FormView />} />
          <Route path="/form" element={<FormView />} />
          <Route path="/dashboard" element={<DashboardView />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
