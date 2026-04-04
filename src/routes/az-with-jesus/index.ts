import { Hono } from "hono";
import { streamRoute } from "./stream.route";
import { stateRoute } from "./state.route";
import { finishRoute } from "./finish.route";

export const azWithJesusRoutes = new Hono();

azWithJesusRoutes.route("/stream", streamRoute);
azWithJesusRoutes.route("/state", stateRoute);
azWithJesusRoutes.route("/finish", finishRoute);