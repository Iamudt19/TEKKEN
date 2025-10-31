import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AddPlantPage from './pages/AddPlantPage';
import MarketplacePage from './pages/MarketplacePage';
import CoinDetailsPage from './pages/CoinDetailsPage';
import LeaderboardPage from './pages/LeaderboardPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [selectedCoinId, setSelectedCoinId] = useState<string>('');

  const handleNavigate = (page: string, coinId?: string) => {
    setCurrentPage(page);
    if (coinId) {
      setSelectedCoinId(coinId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading GreenCoin 2.0...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (!user) {
      return <LandingPage onNavigate={handleNavigate} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'add':
        return <AddPlantPage onNavigate={handleNavigate} />;
      case 'marketplace':
        return <MarketplacePage onNavigate={handleNavigate} />;
      case 'coin':
        return <CoinDetailsPage coinId={selectedCoinId} onNavigate={handleNavigate} />;
      case 'leaderboard':
        return <LeaderboardPage />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {user && <Navbar currentPage={currentPage} onNavigate={handleNavigate} />}
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
