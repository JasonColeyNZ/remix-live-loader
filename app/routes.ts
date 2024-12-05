import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/index.tsx"),
	route("chat", "routes/chat/index.tsx", [
		route("stream", "routes/chat/stream.tsx"),
	]),
	route("todos", "routes/todos/$listSlug.tsx", [
		route(":listSlug", "routes/todos/$listSlug/index.tsx", [
			route("stream", "routes/todos/$listSlug/stream.tsx"),
		]),
	]),
] satisfies RouteConfig;
