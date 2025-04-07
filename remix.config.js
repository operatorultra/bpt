// remix.config.js
module.exports = {
	serverModuleFormat: "esm", // Ensure ESM format
	serverBuildPath: "build/server/index.js",
	publicPath: "/build/",
	future: {
		unstable_cssModules: true, // Enable CSS modules support
		unstable_cssSideEffectImports: true,
	},
};
