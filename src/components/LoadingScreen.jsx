const LoadingScreen = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-backdrop-base)' }}
    >
      <div className="relative">
        <div
          className="absolute -inset-4 rounded-full opacity-20 blur-2xl animate-pulse"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--color-button-primary-from), var(--color-button-primary-to))'
          }}
        ></div>
        <div className="relative flex flex-col items-center gap-4 p-8">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-button-primary-from)' }}
          ></div>
          <div className="relative">
            <div
              className="absolute -inset-1 rounded blur opacity-20"
              style={{
                backgroundImage: 'linear-gradient(to right, var(--color-button-primary-from), var(--color-button-primary-to))'
              }}
            ></div>
            <span className="relative text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;