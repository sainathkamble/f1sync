export const Footer = () => {
  return (
    <footer
      className="w-full border-t border-white/8"
      style={{ background: "rgba(10,10,10,0.95)" }}
    >
      {/* Desktop layout */}
      <div
        className="hidden sm:flex items-center justify-between"
        style={{ padding: "1.5rem 2rem" }}
      >
        {/* Left — balance */}
        <div className="w-32" />

        {/* Center */}
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-gray-400 text-xs tracking-widest uppercase">
            Developed & Maintained by
          </p>
          <p className="text-white/80 text-sm font-bold tracking-wide">
            Sainath Kamble
          </p>
        </div>

        {/* Right — Links */}
        <div className="flex items-center gap-4 w-32 justify-end">
          <a
            href="https://sainathkamble.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors duration-200 group"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
            </svg>
            <span className="relative">
              Website
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </span>
          </a>

          <span className="text-gray-700 text-xs">|</span>

          <a
            href="https://github.com/sainathkamble/f1-project"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors duration-200 group"
          >
            <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            <span className="relative">
              Repo
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </span>
          </a>
        </div>
      </div>

      {/* Mobile layout */}
      <div
        className="flex sm:hidden flex-col items-center gap-3"
        style={{ padding: "1.25rem 1.5rem" }}
      >
        {/* Credit */}
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-gray-400 text-xs tracking-widest uppercase">
            Developed & Maintained by
          </p>
          <p className="text-white/80 text-sm font-bold tracking-wide">
            Sainath Kamble
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5">
          <a
            href="https://sainathkamble.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors duration-200 group"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
            </svg>
            <span className="relative">
              Website
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </span>
          </a>

          <span className="text-gray-700 text-xs">|</span>

          <a
            href="https://github.com/sainathkamble/f1-project"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors duration-200 group"
          >
            <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            <span className="relative">
              Repo
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
};