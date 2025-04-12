export default function Success() {
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

				<div className="bg-white rounded-xl shadow-lg p-8 text-center">
					<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
						<svg
							className="h-6 w-6 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>

					<h2 className="text-xl font-semibold text-gray-800 mb-2">Tot snel!</h2>

					<p className="text-gray-600 mb-6">
						We nemen binnen 1 werkdag contact met je op.
					</p>

					<div className="border-t border-gray-200 pt-6">
						<p className="text-sm text-gray-500">
							Heb je nog vragen? Neem gerust contact met ons op via
							<a
								href="mailto:info@brandpreventietechniek.nl"
								className="text-blue-600 hover:text-blue-800 ml-1"
							>
								info@brandpreventietechniek.nl
							</a>
							<span> of </span>
							<a
								className="text-blue-600 hover:text-blue-800 ml-1"
								href="tel:+31552032293"
							>
								+31 55 203 2293
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
