import { LogOut } from "lucide-react";

interface NavbarProps {
  userName: string | undefined;
  onLogout: () => void;
}

const Navbar = ({ userName, onLogout }: NavbarProps) => {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{userName}</span>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
