export default function AdPush() {
  return (
    <div className="w-full h-[60px] md:h-[80px] bg-gray-900 dark:bg-black flex items-center justify-center border-t border-gray-800 relative pointer-events-auto">
      <div className="text-gray-400 text-xs md:text-sm font-medium tracking-widest uppercase flex items-center gap-2">
        <span>Ad Space</span>
        <span className="text-yellow-500">Monetag In-Page Push</span>
      </div>
      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  );
}
