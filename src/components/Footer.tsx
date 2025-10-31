import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-600 to-emerald-500 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6" />
            <span className="font-semibold">GreenCoin 2.0</span>
          </div>
          <div className="text-sm text-green-100">
            © 2025 Team TEkken. Sustainability meets technology.
          </div>
          <div className="text-sm text-green-100">
            Every tree planted makes a difference 🌱
          </div>
        </div>
      </div>
    </footer>
  );
}
