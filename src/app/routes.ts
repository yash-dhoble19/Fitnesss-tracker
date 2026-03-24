import { createBrowserRouter } from "react-router";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Onboarding from "./screens/Onboarding";
import Dashboard from "./screens/Dashboard";
import Schedule from "./screens/Schedule";
import Leaderboard from "./screens/Leaderboard";
import Coach from "./screens/Coach";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/onboarding",
    Component: Onboarding,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/schedule",
    Component: Schedule,
  },
  {
    path: "/leaderboard",
    Component: Leaderboard,
  },
  {
    path: "/coach",
    Component: Coach,
  },
]);
