import { Form, redirect, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { json, createCookie } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
import React, { useState } from "react";
import ReviewBadge from "~/components/Reviews";
import BrandCarousel from "~/components/Carousel";

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
		fireExtinguishers?: boolean;
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
	const fireExtinguishers = formData.get("fireExtinguishers") as string | null;

	const errors: ActionData["errors"] = {};
	if (!name) errors.name = true;
	// if (!email) errors.email = true;
	if (!phone) errors.phone = true;
	// if (!message) errors.message = true;
	// if (!fireExtinguishers) errors.fireExtinguishers = true;

	if (Object.keys(errors).length > 0) {
		return json<ActionData>({ errors });
	}

	const emailTarget = process.env.EMAIL_TARGET;
	const subject = `Nieuw formulier bericht van ${name}`;
	const body = `Naam: ${name}\nEmail: ${email}\nBericht: ${message}\nTelefoon: ${phone}\nAantal brandblussers: ${fireExtinguishers}`;

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
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);

	const formRef = React.useRef<HTMLFormElement>(null);
	React.useEffect(() => {
		if (navigation.state === "idle" && !actionData?.errors) {
			formRef.current?.reset();
			setIsButtonDisabled(false);
		}
	}, [navigation.state, actionData]);

	const handleSubmit = () => {
		setIsButtonDisabled(true);
	};

	// Dynamic welcome message
	const welcomeMessage =
		name && company_name
			? `Welkom, ${name}! Maak ${company_name} brandveilig!`
			: "Welkom, maak uw bedrijf brandveilig!";

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
			<header className="flex flex-col items-start p-4">
				<a
					href="https://brandpreventietechniek.nl"
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-500 hover:text-blue-700"
				>
					<img
						src="https://brandpreventietechniek.nl/wp-content/uploads/2023/10/11-logo-BPT.png"
						alt="Brandpreventietechniek Logo"
						className="h-10 w-auto"
					/>
				</a>
			</header>
			<div className="max-w-2xl mx-auto p-8 flex-grow" style={{ marginTop: "-40px" }}>
				<div className="bg-white rounded-xl shadow-lg p-8">
					<div className="mb-4">
						<h2 className="text-black mb-2 text-lg">
							Nieuwsgierig wat we voor {company_name ? `${company_name} ` : "jou "}{" "}
							kunnen betekenen?
						</h2>

						<p className="text-black text-xs ">
							Contactformulier voor een vrijblijvend telefonisch overleg.
						</p>
					</div>

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
								placeholder="Vul hier je naam in"
							/>
							{actionData?.errors?.name && (
								<p className="mt-1 text-sm text-red-600">Naam is verplicht</p>
							)}
						</div>

						<div>
							<label
								htmlFor="email"
								className="hidden text-sm font-medium text-gray-700 mb-1"
							>
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								defaultValue={email || ""}
								className="hidden w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
								placeholder="06-nummer waarop je bereikbaar bent"
							/>
							{actionData?.errors?.phone && (
								<p className="mt-1 text-sm text-red-600">
									Telefoonnummer is verplicht
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="fireExtinguishers"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Aantal brandblussers
							</label>
							<input
								id="fireExtinguishers"
								name="fireExtinguishers"
								type="number"
								min="0"
								className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
								placeholder="Bijv. 3 stuks"
							/>
							{actionData?.errors?.fireExtinguishers && (
								<p className="mt-1 text-sm text-red-600">
									Aantal brandblussers is verplicht
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="message"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Vragen of opmerkingen
							</label>
							<textarea
								id="message"
								name="message"
								rows={4}
								className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
								placeholder='Bijv. "We hebben ook een brandslanghaspel"'
							/>
							{actionData?.errors?.message && (
								<p className="mt-1 text-sm text-red-600">Bericht is verplicht</p>
							)}
						</div>

						<div>
							<button
								type="submit"
								disabled={
									isSubmitting ||
									isButtonDisabled ||
									actionData?.errors?.submission
								}
								className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
									isSubmitting || isButtonDisabled
										? "opacity-50 cursor-not-allowed"
										: ""
								}`}
								onClick={handleSubmit}
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
			<div className="p-8">
				<div className="text-center mb-4" style={{ marginTop: "-80px" }}>
					<p className="text-lg font-semibold text-gray-800">
						Meer dan 10.000 tevreden klanten gingen je al voor
					</p>
				</div>
				<ReviewBadge />
				<BrandCarousel />
			</div>
		</div>
	);
}
