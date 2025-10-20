import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  // * matches all URLs, the ? makes it optional so it will match / as well
  route("/", "./pages/Home.jsx"),
  route("/wordle", "./pages/Wordle.jsx"),
  route("*?", "catchall.tsx"),
] satisfies RouteConfig;
