interface Env {
    mode: string | undefined;
    api: {
        MAIN_API_URL: string | undefined
    };
}

const env: Env = {
    mode: process.env.NODE_ENV,
    api: {
        MAIN_API_URL: process.env.SPRING_SERVER_API_URL,
    },
};

export default env;
