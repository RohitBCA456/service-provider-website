import React from "react";

export default function Footer() {
  const footerNavs = [
    { href: "/", name: "Home" },
    { href: "/about", name: "About" },
    { href: "/services", name: "Services" },
    { href: "/contact", name: "Contact" },
    { href: "/support", name: "Support" },
  ];

  return (
    <footer className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white px-4 py-10 mx-auto md:px-8 w-full">
      <div className="max-w-lg sm:mx-auto sm:text-center">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">ServiceFinder</h2>
        <p className="leading-relaxed mt-2 text-[15px]">
          Your one-stop destination to find trusted professionals near you —
          plumbers, electricians, tutors, and more.
        </p>
      </div>

      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-4 mt-8 text-sm">
        {footerNavs.map((item, idx) => (
          <li key={idx}>
            <a
              href={item.href}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {item.name}
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm text-center sm:text-left">
          &copy; {new Date().getFullYear()} ServiceFinder. All rights reserved.
        </p>

        <ul className="flex items-center space-x-4 mt-4 sm:mt-0">
          <li>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-500">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 6v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
          </li>
          <li>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-800">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 3a2 2 0 110 4 2 2 0 010-4z" />
              </svg>
            </a>
          </li>
          <li>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-800 dark:text-gray-100 hover:text-indigo-500">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.17c-3.34.72-4.03-1.61-4.03-1.61a3.18 3.18 0 00-1.34-1.75c-1.1-.76.09-.75.09-.75a2.52 2.52 0 011.84 1.23 2.54 2.54 0 003.47 1 2.54 2.54 0 01.76-1.6c-2.67-.3-5.47-1.34-5.47-5.94a4.64 4.64 0 011.23-3.22 4.3 4.3 0 01.12-3.18s1-.32 3.3 1.23a11.4 11.4 0 016 0c2.28-1.55 3.3-1.23 3.3-1.23a4.3 4.3 0 01.12 3.18 4.64 4.64 0 011.23 3.22c0 4.61-2.8 5.63-5.48 5.93a2.85 2.85 0 01.82 2.22v3.29c0 .32.21.7.83.58A12 12 0 0012 0z" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
