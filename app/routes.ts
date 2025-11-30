import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard/route.tsx"),
  route("branches", "routes/branches/index.tsx"),
  route("branches/:id", "routes/branches/show.tsx"),
  route("branches/:id/edit", "routes/branches/edit.tsx"),
] satisfies RouteConfig;
