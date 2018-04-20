const path = require("path");

module.exports = {
	mode: "development",
	entry: [
		"./src/index.tsx",
	],
	output: {
		filename: "bundle.js",
		path: __dirname + "/public/dist"
	},
	devtool: "source-map",
	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: [".ts", ".tsx", ".js", ".json"]
	},
	module: {
		rules: [
			// All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
			{
				test: /\.tsx?$/, 
				loader: "awesome-typescript-loader",
				exclude: [
					path.resolve(__dirname, "/server"),
				]
			},

			// All output '.js' files have any sourcemaps re-processed by 'source-map-loader'.
			{ enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
		]
	},

	// When importing a module whose path matches one of the following, just
	// asssume a corresponding global variable exists and use that instead.
	// This is important because it allows us to avoid bundling all of our
	// dpendencies, which allows browsers to cahce those libraries between builds.
	externals: {
		"react": "React",
		"react-dom": "ReactDOM",
		"axios": "axios"
	}
}

