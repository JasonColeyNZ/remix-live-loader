import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import {
	type AppLoadContext,
	type EntryContext,
	ServerRouter,
} from "react-router";

const ABORT_DELAY = 5000;

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	context: EntryContext,
	appContext: AppLoadContext
) {
	const callbackName = isbot(request.headers.get("user-agent"))
		? "onAllReady"
		: "onShellReady";

	return new Promise((resolve, reject) => {
		let didError = false;

		const { pipe, abort } = renderToPipeableStream(
			<ServerRouter
				abortDelay={ABORT_DELAY}
				context={context}
				url={request.url}
			/>,

			{
				[callbackName]: () => {
					const body = new PassThrough();
					const stream = createReadableStreamFromReadable(body);
					responseHeaders.set("Content-Type", "text/html");

					resolve(
						// @ts-expect-error - We purposely do not define the body as existent so it's not used inside loaders as it's injected there as well
						appContext.body(stream, {
							headers: responseHeaders,
							status: didError ? 500 : responseStatusCode,
						})
					);

					pipe(body);
				},
				onShellError(error: unknown) {
					reject(error);
				},
				onError(error: unknown) {
					didError = true;
					// biome-ignore lint/suspicious/noConsole: We console log the error
					console.error(error);
				},
			}
		);

		setTimeout(abort, ABORT_DELAY);
	});
}
