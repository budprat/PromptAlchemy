import { useSidebar } from "@/contexts/SidebarContext";

export default function MobileHeader() {
  const { isMobileSidebarOpen, toggleMobileSidebar } = useSidebar();

  return (
    <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white font-bold mr-2">
          <i className="ri-flask-line text-lg"></i>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
          PromptAlchemy
        </span>
      </div>
      <button
        type="button"
        className="text-slate-500 hover:text-slate-700"
        onClick={toggleMobileSidebar}
        aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
      >
        <i className={`ri-${isMobileSidebarOpen ? 'close' : 'menu'}-line text-2xl`}></i>
      </button>
    </div>
  );
}
