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
import TableList from "./pages/TableList.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import StackListActionMenu from "./components/ChatMenu.jsx";
import ChatPage from "./pages/ChatUi.jsx";
import AddServicePage from "./pages/AddServicePage.jsx";

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
      { path: "/Features", element: <TableList />},
      { path: "/Profile", element: <ProfilePage />},
      { path: "/ChatMenu", element: <StackListActionMenu />},
      { path: "/ChatRoom/:userId", element: <ChatPage />},
      { path: "/AddService", element: <AddServicePage />}
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
