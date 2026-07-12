import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import FooterIndex from './components/navigation/FooterIndex';
import NavBar from './components/navigation/NavBar';
import WorksScreen from './components/screens/WorksScreen';
import WorkDetailScreen from './components/screens/WorkDetailScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import ContactScreen from './components/screens/ContactScreen';
import LandingPage from './components/screens/LandingPage';
import AdminScreen from './components/screens/AdminScreen';
import { Work } from './data';
import { apiFetch } from './lib/api';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('Works');
  const [selectedProject, setSelectedProject] = useState<Work | null>(null);
  const [showGlobalNavBar, setShowGlobalNavBar] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const savedScrollY = useRef<number>(0);

  // Check admin status on load and intercept /admin route path
  useEffect(() => {
    apiFetch('/api/admin/status')
      .then(res => res.json())
      .then(data => {
        setIsAdmin(!!data.isAdmin);
      })
      .catch(err => console.error('[Auth] Initial authentication check failed:', err));

    if (window.location.pathname === '/admin') {
      setCurrentView('Admin');
    }
  }, []);

  // Scroll management on view changes - run synchronously with paint using useLayoutEffect
  useLayoutEffect(() => {
    if (currentView !== 'Works') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      // Restore previous scroll position on returning to Works
      window.scrollTo({ top: savedScrollY.current, behavior: 'instant' });
    }
  }, [currentView, selectedProject]);

  // Track scroll position to fade in/out global NavBar when on Works view
  useEffect(() => {
    if (currentView !== 'Works') {
      setShowGlobalNavBar(true);
      return;
    }

    const handleScroll = () => {
      // Show global nav bar after scrolling past the landing page
      const threshold = window.innerHeight - 80;
      setShowGlobalNavBar(window.scrollY >= threshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const handleSelectProject = (project: Work) => {
    if (currentView === 'Works') {
      savedScrollY.current = window.scrollY;
    }
    setSelectedProject(project);
    setCurrentView('Detail');
  };

  const handleSelectNav = (viewName: string) => {
    if (currentView === 'Works' && viewName !== 'Works') {
      savedScrollY.current = window.scrollY;
    }
    setSelectedProject(null);
    setCurrentView(viewName);
  };

  const handleNavigateBack = () => {
    setSelectedProject(null);
    setCurrentView('Works');
  };

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-50 selection:bg-klein selection:text-paper-0">
      {/* Global NavBar */}
      {showGlobalNavBar && (
        <NavBar 
          active={currentView === 'Detail' ? 'Works' : currentView} 
          onSelect={handleSelectNav} 
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-grow ${currentView !== 'Works' ? 'pt-24' : ''}`}>
        <div className={currentView === 'Works' ? 'relative block w-full' : 'hidden'}>
          {/* Landing page fixed/sticky at the bottom layer */}
          <div className="sticky top-0 h-screen w-full z-0 overflow-hidden">
            <LandingPage onNavigate={handleSelectNav} onScrollDown={handleScrollDown} />
          </div>
          
          {/* Works screen sliding up over the landing page */}
          <div className="relative z-10 bg-paper-50 shadow-[0_-15px_30px_rgba(0,0,0,0.15)]">
            <WorksScreen 
              onSelectProject={handleSelectProject} 
              isViewActive={currentView === 'Works'} 
              onNavigate={handleSelectNav}
            />
          </div>
        </div>

        {currentView === 'Detail' && selectedProject && (
          <WorkDetailScreen 
            project={selectedProject} 
            onNavigateBack={handleNavigateBack}
            onSelectProject={handleSelectProject}
            isAdmin={isAdmin}
            onNavigate={handleSelectNav}
          />
        )}

        {currentView === 'Admin' && (
          <AdminScreen 
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
            onSelectProject={handleSelectProject}
          />
        )}

        {currentView === 'About' && (
          <ProfileScreen />
        )}

        {currentView === 'Contact' && (
          <ContactScreen />
        )}
      </main>

      {/* Dynamic Archival Footer */}
      <FooterIndex onNavigate={handleSelectNav} />
    </div>
  );
}
