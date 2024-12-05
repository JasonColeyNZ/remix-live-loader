import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { useState } from "react";
import { db } from "~/utils/db.server";
import { emitter } from "~/utils/emitter.server";
import { useLiveLoader } from "~/utils/use-live-loader";

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData();
	const id = formData.get("id") as string | null;
	const completed = formData.get("completed") as string | null;
	const title = formData.get("title") as string | null;
	const action = formData.get("action") as string | null;

	await handleTodoAction({
		id,
		title,
		completed,
		action,
		listSlug: params.listSlug || "",
	});

	emitter.emit(params.listSlug || "");

	return null;
}

export async function loader({ params }: LoaderFunctionArgs) {
	const listWithTodos = await db.todoList.findFirstOrThrow({
		where: { slug: params.listSlug },
		include: {
			todos: {
				orderBy: { createdAt: "asc" },
			},
		},
	});

	const { todos, ...list } = listWithTodos;

	return { list, todos, time: Date.now() };
}

export default function Index() {
	const { list, todos, time } = useLiveLoader<typeof loader>();
	console.log(time);
	return (
		<div className="text-4xl p-16 text-primary-100" key={time}>
			<h1 className="font-medium capitalize text-7xl">{list.title}</h1>
			<div className="mt-8">
				<div className="flex flex-col gap-4">
					{todos.map((todo) => (
						<Todo key={todo.id} {...todo} />
					))}

					<NewTodo />
				</div>
			</div>
		</div>
	);
}

function Todo({
	title,
	completed,
	id,
}: {
	title: string;
	completed: boolean;
	id: string;
}) {
	const fetcher = useFetcher();
	const [optimisticTitle, setOptimisticTitle] = useState(title);

	return (
		<div className="flex items-center gap-4 transition-all">
			<input
				type="checkbox"
				checked={
					fetcher.formData
						? Boolean(fetcher.formData.get("completed") === "true")
						: completed
				}
				onChange={(e) => {
					fetcher.submit(
						{
							completed: e.target.checked,
							id: id,
							action: "completed",
						},
						{
							method: "PUT",
						}
					);
				}}
				className="h-8 w-8 text-primary-500 bg-transparent border-2 border-primary-100/80 rounded focus:ring-0"
			/>
			<input
				type="text"
				value={optimisticTitle}
				onChange={(e) => {
					setOptimisticTitle(e.target.value);
				}}
				onBlur={() => {
					fetcher.submit(
						{
							title: optimisticTitle,
							id: id,
							action: "title",
						},
						{
							method: "PUT",
						}
					);
				}}
				className={`w-full text-primary-100 border text-3xl h-12 bg-transparent border-none outline-none focus:ring-0 ${
					completed ? "line-through opacity-60" : ""
				}`}
			/>
		</div>
	);
}

function NewTodo() {
	const fetcher = useFetcher();

	return (
		<div className="flex items-center gap-4">
			<input
				type="checkbox"
				className="h-8 w-8 bg-transparent border-2 border-secondary-300/30 rounded focus:ring-0"
				disabled
			/>
			<input
				type="text"
				name="title"
				placeholder="To-do"
				className="w-full border text-3xl h-12 bg-transparent placeholder:text-primary-300/30 border-none outline-none focus:ring-0"
				onBlur={(e) => {
					e.target.value &&
						fetcher.submit(
							{
								title: e.target.value,
								action: "title",
							},
							{
								method: "POST",
							}
						);
				}}
			/>
		</div>
	);
}

function assert(condition: string | null, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

function handleTodoAction({
	id,
	title,
	completed,
	action,
	listSlug,
}: {
	id: string | null;
	title: string | null;
	completed: string | null;
	action: string | null;
	listSlug: string;
}) {
	assert(action, "Action is required");

	if (!id) {
		assert(title, "Title is required");

		return db.todo.create({
			data: {
				title,
				completed: false,
				list: {
					connect: { slug: listSlug },
				},
			},
		});
	}
	if (action === "title") {
		if (!title) {
			return db.todo.delete({ where: { id } });
		}
		return db.todo.update({
			where: { id },
			data: { title },
		});
	}
	if (action === "completed") {
		assert(completed, "Completed is required");

		console.log(completed);
		return db.todo.update({
			where: { id },
			data: { completed: completed === "true" },
		});
	}
}
