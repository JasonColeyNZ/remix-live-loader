import { useLoaderData, useResolvedPath, useRevalidator } from "react-router";
import { useEffect } from "react";
import { useEventSource } from "remix-utils/sse/react";

export function useLiveLoader<T>() {
	const path = useResolvedPath("./stream");
	const data = useEventSource(path.pathname);

	const { revalidate } = useRevalidator();

	// biome-ignore lint/correctness/useExhaustiveDependencies: We know better
	useEffect(() => {
		revalidate();
	}, [data]);

	return useLoaderData<T>();
}
