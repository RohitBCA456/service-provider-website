import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const location = useLocation();

  // Detect if current path is signup page
  const hideLayout = location.pathname === "/" || location.pathname === "/login";

  useEffect(() => {
    document.body.className =
      theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black";
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen transition-colors duration-300 flex flex-col">
        {!hideLayout && <Header theme={theme} setTheme={setTheme} />}
        <main className="flex-grow">
          <Outlet context={{ theme, setTheme }} />
        </main>
        {!hideLayout && <Footer />}
      </div>
    </>
  );
}

export default App;
