/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
	server: './server.js',
	ignoredRouteFiles: ['.*'],
	devServerBroadcastDelay: 1000,
	// appDirectory: "app",
	assetsBuildDirectory: '.moul/public/build',
	// serverBuildPath: "build/index.js",
	publicPath: '/build/',
}
