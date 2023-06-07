import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

import Start from "./components/Start/Start";
import InstanceViewer from "./components/InstanceViewer/InstanceViewer.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Start />,
  },
  {
    path: "/instances/:uuid",
    element: <InstanceViewer />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="container">
    <nav className="navbar">
      <div className="container">
        <a className="navbar-brand" href="/">
          <b>{"Jonathan's eFLINT GUI"}</b>
        </a>
      </div>
    </nav>
    <RouterProvider router={router} />
  </div>
);
