module.exports = {
    devServer: {
        port: 8080,
        disableHostCheck: true,

        // Redirect API requests to the API server.
        proxy: {
            "^/v1/": {
                target: "http://localhost:5002/",
                secure: false
            }
        }
    }
};
