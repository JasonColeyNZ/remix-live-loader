import type { LoaderFunctionArgs } from "react-router";
import { createEventStream } from "~/utils/create-event-stream.server";

export function loader({ request, params }: LoaderFunctionArgs) {
	return createEventStream(request, params.listSlug || "");
}
