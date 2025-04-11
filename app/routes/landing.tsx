import { Form, redirect, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { json, createCookie } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
import React from "react";

dotenv.config();

interface LoaderData {
	name: string | null;
	company_name: string | null;
	email: string | null;
}

interface ActionData {
	errors?: {
		name?: boolean;
		email?: boolean;
		message?: boolean;
		submission?: boolean;
		phone?: boolean;
	};
}

export const cookie = createCookie("form-session", {
	secrets: ["s3cr3t"],
	sameSite: "lax",
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	return json<LoaderData>({
		name: url.searchParams.get("name"),
		company_name: url.searchParams.get("company"),
		email: url.searchParams.get("email"),
	});
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const name = formData.get("name") as string | null;
	const email = formData.get("email") as string | null;
	const message = formData.get("message") as string | null;
	const phone = formData.get("phone") as string | null;

	const errors: ActionData["errors"] = {};
	if (!name) errors.name = true;
	if (!email) errors.email = true;
	if (!message) errors.message = true;
	if (!phone) errors.phone = true;

	if (Object.keys(errors).length > 0) {
		return json<ActionData>({ errors });
	}

	const emailTarget = process.env.EMAIL_TARGET;
	const subject = `Nieuw formulier bericht van ${name}`;
	const body = `Naam: ${name}\nEmail: ${email}\nBericht: ${message}\nTelefoon: ${phone}`;

	try {
		// Debugging: Log environment variables
		console.log("SMTP Config:", {
			host: process.env.SMTP_SERVER,
			port: process.env.SMTP_PORT,
			user: process.env.SMTP_USER,
			from: process.env.EMAIL_FROM,
			target: emailTarget,
		});

		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_SERVER,
			port: Number(process.env.SMTP_PORT),
			secure: false, // true for 465, false for other ports
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASSWORD,
			},
			tls: {
				rejectUnauthorized: false, // Add this for self-signed certificates
			},
			debug: true,
			logger: true,
		});

		await transporter.sendMail({
			from: `"Contact Form" <${process.env.EMAIL_FROM}>`,
			to: emailTarget,
			subject,
			text: body,
		});

		return redirect("/success", {
			status: 303,
		});
	} catch (error) {
		console.error("Email error:", error);
		return json<ActionData>({ errors: { submission: true } });
	}
};

export default function Landing() {
	const { name, company_name, email } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	const formRef = React.useRef<HTMLFormElement>(null);
	React.useEffect(() => {
		if (navigation.state === "idle" && !actionData?.errors) {
			formRef.current?.reset();
		}
	}, [navigation.state, actionData]);

	// Dynamic welcome message
	const welcomeMessage =
		name && company_name
			? `Welkom, ${name}! Maak ${company_name} brandveilig!`
			: "Welkom, maak uw bedrijf brandveilig!";

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			<div className="max-w-2xl mx-auto p-6">
				<header className="flex flex-col items-center mb-10">
					<img
						src="https://brandpreventietechniek.nl/wp-content/uploads/2023/10/11-logo-BPT.png"
						alt="Brandpreventietechniek Logo"
						className="h-24 w-auto"
					/>
				</header>

				<div className="bg-white rounded-xl shadow-lg p-8">
					<h2 className="text-xl font-semibold text-gray-800 mb-6">{welcomeMessage}</h2>
					<Form method="post" className="space-y-6" ref={formRef}>
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Naam <span className="text-red-500">*</span>
							</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								defaultValue={name || ""}
								className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
								placeholder="Uw naam"
							/>
							{actionData?.errors?.name && (
								<p className="mt-1 text-sm text-red-600">Naam is verplicht</p>
							)}
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email <span className="text-red-500">*</span>
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								defaultValue={email || ""}
								className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
								placeholder="Uw email"
							/>
							{actionData?.errors?.email && navigation.state !== "idle" && (
								<p className="mt-1 text-sm text-red-600">Email is verplicht</p>
							)}
						</div>

						<div>
							<label
								htmlFor="phone"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Telefoonnummer
								<span className="text-red-500">*</span>
							</label>
							<input
								id="phone"
								name="phone"
								type="tel"
								required
								className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
								placeholder="Het nummer waarop wij u het best kunnen bereiken."
							/>
							{actionData?.errors?.phone && (
								<p className="mt-1 text-sm text-red-600">
									Telefoonnummer is verplicht
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="message"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Bericht
							</label>
							<textarea
								id="message"
								name="message"
								rows={4}
								className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
								placeholder="Heeft u specifieke vragen of wensen? Plaats die dan hier."
							/>
							{actionData?.errors?.message && (
								<p className="mt-1 text-sm text-red-600">Bericht is verplicht</p>
							)}
						</div>

						<div>
							<button
								type="submit"
								disabled={isSubmitting || actionData?.errors?.submission}
								className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
									isSubmitting ? "opacity-50 cursor-not-allowed" : ""
								}`}
							>
								{isSubmitting ? "Verzenden..." : "Verzenden"}
							</button>
							{actionData?.errors?.submission && (
								<p className="mt-2 text-sm text-red-600">
									Er is een fout opgetreden bij het verzenden. Probeer het later
									opnieuw.
								</p>
							)}
						</div>
					</Form>
				</div>
			</div>
		</div>
	);
}
