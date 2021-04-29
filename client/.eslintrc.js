module.exports = {
    root: false,
    env: {
        es2020: true,
        browser: true,
    },
    plugins: ["react"],
    extends: ["plugin:react/recommended"],
    settings: {
        react: {
            pragma: "React",
            version: "detect",
        },
    },
};
