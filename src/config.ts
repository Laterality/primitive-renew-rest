export const config = {
	port: 3100,
	https: {
		use: false,
		key: "PATH_TO_PRIVATE_KEY",
		cert: "PATH_TO_PUBLIC_KEY",
	},
	db: {
		dbms: "mongodb", // one of ["in-memory", "mongodb"]
		uri: "mongodb://localhost:27017/primitive",
	},
	path_public: "/home/server/apps/public/primitive/uploads", // definite path
	test: {
		baseurl: "http://trailblazer.latera.kr/yd/api/v1",
	},
};
