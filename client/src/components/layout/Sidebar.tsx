import { Link, useLocation } from "wouter";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type NavItemProps = {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
};

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => (
  <Link href={href} 
    className={cn(
      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
      isActive
        ? "bg-primary-50 text-primary-700" 
        : "text-slate-700 hover:bg-slate-100"
    )}
  >
    <i className={`${icon} mr-2 text-lg`}></i>
    <span>{label}</span>
  </Link>
);

export default function Sidebar() {
  const [location] = useLocation();
  const { isMobileSidebarOpen } = useSidebar();
  const { user } = useAuth();

  const sidebarClass = cn(
    "bg-white border-r border-slate-200 w-full md:w-64 md:flex md:flex-col md:fixed md:inset-y-0 z-20",
    isMobileSidebarOpen ? "fixed inset-0 z-50" : "hidden md:flex"
  );

  return (
    <aside className={sidebarClass}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white font-bold mr-2">
            <i className="ri-flask-line text-lg"></i>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
            PromptAlchemy
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Main
        </div>

        <NavItem
          href="/"
          icon="ri-dashboard-line"
          label="Dashboard"
          isActive={location === "/"}
        />

        <NavItem
          href="/evaluate"
          icon="ri-magic-line"
          label="Evaluate Prompts"
          isActive={location === "/evaluate"}
        />

        <NavItem
          href="/optimize"
          icon="ri-test-tube-line"
          label="Optimization Studio"
          isActive={location === "/optimize"}
        />

        <NavItem
          href="/vault"
          icon="ri-archive-line"
          label="Prompt Vault"
          isActive={location === "/vault"}
        />

        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2">
          Team
        </div>

        <NavItem
          href="/collaborate"
          icon="ri-team-line"
          label="Collaborate"
          isActive={location === "/collaborate"}
        />

        <NavItem
          href="/settings"
          icon="ri-settings-4-line"
          label="Settings"
          isActive={location === "/settings"}
        />
      </nav>

      {/* User Profile */}
      {user ? (
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center">
            {user.profileImage ? (
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={user.profileImage}
                alt={`${user.name}'s profile`}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-700">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-slate-200">
          <a
            href="/api/login"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <i className="ri-login-box-line mr-2"></i> Login
          </a>
        </div>
      )}
    </aside>
  );
}
