import { Leaf, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type NavbarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onNavigate('landing');
  };

  return (
    <nav className="bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(user ? 'dashboard' : 'landing')}>
            <Leaf className="w-8 h-8" />
            <span className="text-xl font-bold">GreenCoin 2.0</span>
          </div>

          {user && (
            <div className="flex items-center gap-6">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`hover:text-green-100 transition-colors ${currentPage === 'dashboard' ? 'font-semibold' : ''}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('marketplace')}
                className={`hover:text-green-100 transition-colors ${currentPage === 'marketplace' ? 'font-semibold' : ''}`}
              >
                Marketplace
              </button>
              <button
                onClick={() => onNavigate('leaderboard')}
                className={`hover:text-green-100 transition-colors ${currentPage === 'leaderboard' ? 'font-semibold' : ''}`}
              >
                Leaderboard
              </button>
              <div className="flex items-center gap-4 pl-6 border-l border-green-400">
                <div className="text-right">
                  <div className="text-sm font-medium">{profile?.full_name || 'User'}</div>
                  <div className="text-xs text-green-100">Balance: ${profile?.balance || 0}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-green-700 rounded-full transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
