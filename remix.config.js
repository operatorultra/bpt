// remix.config.js
module.exports = {
	serverModuleFormat: "esm", // Ensure ESM format
	future: {
		unstable_cssModules: true, // Enable CSS modules support
		unstable_cssSideEffectImports: true,
	},
};
