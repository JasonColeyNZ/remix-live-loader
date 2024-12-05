import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { denyImports, envOnlyMacros } from "vite-env-only";
import { reactRouterHonoServer } from "react-router-hono-server/dev";

export default defineConfig({
	plugins: [
		denyImports({}),
		envOnlyMacros(),
		reactRouter(),
		// reactRouterHonoServer(),

		tsconfigPaths(),
	],
	server: {
		open: true,
		port: 3050,
	},
});
