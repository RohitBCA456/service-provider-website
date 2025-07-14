import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx"
import Home from "./pages/Home.jsx"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateAccount from "./components/SignUp.jsx";
import Login from "./components/Login.jsx";
import ListProviders from "./pages/ListProviders.jsx";
import ProviderHome from "./pages/ProviderHome.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <CreateAccount /> },
      { path: "Home", element: <Home /> },
      { path: "ProviderHome", element: <ProviderHome />},
      { path: "Login", element: <Login /> },
      { path: "Providers", element: <ListProviders /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
