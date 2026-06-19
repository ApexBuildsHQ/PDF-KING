export default function AdBanner() {
  return (
    <div 
      className="w-full max-w-4xl mx-auto px-4"
      style={{ margin: '8px 0' }}
    >
      <div 
        className="w-full border border-dashed border-gray-300 dark:border-gray-700 rounded-xl"
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '50px',
          maxHeight: '90px',
          backgroundColor: 'transparent'
        }}
      >
        <span className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">
          Ad Space (Slim Responsive)
        </span>
      </div>
    </div>
  );
}
