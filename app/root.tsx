import "./tailwind.css";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { Hero } from "~/components/hero";

export default function App() {
	return (
		<html lang={"en"} className="bg-secondary-800">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body
				style={{
					fontFamily:
						"ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji",
				}}>
				<Outlet />
				<Hero />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
