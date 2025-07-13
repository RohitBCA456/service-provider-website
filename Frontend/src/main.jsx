import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx"
import Home from "./pages/Home.jsx"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateAccount from "./components/SignUp.jsx";
import Login from "./components/Login.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <CreateAccount /> }, // This means path="/" renders Home
      { path: "Home", element: <Home /> },
      { path: "Login", element: <Login /> },
      // { path: "skills", element: <Skill /> },
      // { path: "contact", element: <Contact /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
