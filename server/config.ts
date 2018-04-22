export const config = {
	port: 3100,
	https: {
		use: false,
		key: "PATH_TO_PRIVATE_KEY",
		cert: "PATH_TO_PUBLIC_KEY",
	},
	db: {
		uri: "MONGODB_URI",

	},
	path_public: "/home/server/apps/public/primitive-web", // definite path
	test: {
		baseurl: "http://trailblazer.latera.kr/yd/api/v1",
	},
	front: {
		// the base url for API calls
		baseurl: "http://localhost:3100",
	},
};
