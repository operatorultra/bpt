/** @type {import('@remix-run/dev').AppConfig} */
export default {
	ignoredRouteFiles: ["**/.*"],
	serverModuleFormat: "esm",
	serverBuildPath: "build/server/index.js",
	publicPath: "/build/",
	future: {
		unstable_cssModules: true,
		unstable_cssSideEffectImports: true,
	},
};
