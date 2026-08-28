const MODEL = "@cf/meta/llama-3.2-3b-instruct";

const SYSTEM_PROMPT = `You are Work AI, a helpful workplace assistant running on Cloudflare Workers AI.
Help with work tasks such as writing emails, summarizing notes, brainstorming ideas, planning projects,
and answering professional questions. Be concise, clear, and practical.`;

type ChatMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

function corsHeaders(): HeadersInit {
	return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};
}

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json",
			...corsHeaders(),
		},
	});
}

function extractReply(response: unknown): string {
	if (
		typeof response === "object" &&
		response !== null &&
		"response" in response &&
		typeof (response as { response?: unknown }).response === "string"
	) {
		return (response as { response: string }).response;
	}

	if (
		typeof response === "object" &&
		response !== null &&
		"choices" in response &&
		Array.isArray((response as { choices?: unknown[] }).choices)
	) {
		const content = (response as { choices: Array<{ message?: { content?: string } }> }).choices[0]
			?.message?.content;
		if (typeof content === "string") return content;
	}

	return JSON.stringify(response);
}

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders() });
		}

		if (url.pathname === "/api/chat" && request.method === "POST") {
			try {
				const body = (await request.json()) as { message?: string; history?: ChatMessage[] };
				const message = body.message?.trim();

				if (!message) {
					return json({ error: "Message is required." }, 400);
				}

				const history = (body.history ?? []).filter(
					(entry) => entry.role === "user" || entry.role === "assistant",
				);

				const messages: ChatMessage[] = [
					{ role: "system", content: SYSTEM_PROMPT },
					...history.slice(-8),
					{ role: "user", content: message },
				];

				const response = await env.AI.run(MODEL, { messages });
				return json({ reply: extractReply(response) });
			} catch (error) {
				const detail = error instanceof Error ? error.message : "Unknown error";
				return json({ error: "Failed to generate a response.", detail }, 500);
			}
		}

		if (url.pathname === "/api/health") {
			return json({ ok: true, model: MODEL });
		}

		return new Response("Not Found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
