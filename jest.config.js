module.exports = {
    preset: "@vue/cli-plugin-unit-jest",
    verbose: true,
    transformIgnorePatterns: ["/node_modules"],
    moduleFileExtensions: ["js", "json", "vue"],
    transform: {
        ".*\\.(js)$": "babel-jest",
        ".*\\.(vue)$": "vue-jest"

    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    // testMatch: [
    //     "<rootDir>/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))",
    //     "<rootDir>/tests/integration/**/*.spec.(js|jsx|ts|tsx)"
    // ]
};
