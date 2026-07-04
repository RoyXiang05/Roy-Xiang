import { useState, useEffect } from 'react';
import NavBar from './components/navigation/NavBar';
import FooterIndex from './components/navigation/FooterIndex';
import WorksScreen from './components/screens/WorksScreen';
import WorkDetailScreen from './components/screens/WorkDetailScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import ContactScreen from './components/screens/ContactScreen';
import { Work } from './data';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('Works');
  const [selectedProject, setSelectedProject] = useState<Work | null>(null);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView, selectedProject]);

  const handleSelectProject = (project: Work) => {
    setSelectedProject(project);
    setCurrentView('Detail');
  };

  const handleSelectNav = (viewName: string) => {
    setSelectedProject(null);
    setCurrentView(viewName);
  };

  const handleNavigateBack = () => {
    setSelectedProject(null);
    setCurrentView('Works');
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-50 selection:bg-klein selection:text-paper-0">
      {/* Dynamic Header */}
      <NavBar 
        active={currentView === 'Detail' ? 'Works' : currentView} 
        onSelect={handleSelectNav} 
        sticky={true} 
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        <div className={currentView === 'Works' ? 'block' : 'hidden'}>
          <WorksScreen onSelectProject={handleSelectProject} />
        </div>

        {currentView === 'Detail' && selectedProject && (
          <WorkDetailScreen 
            project={selectedProject} 
            onNavigateBack={handleNavigateBack}
            onSelectProject={handleSelectProject}
          />
        )}

        {currentView === 'Profile' && (
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
