module.exports = {
  root: false,
  env: {
    browser: true
  },
  plugins: [
    "react"
  ],
  extends: [
    "plugin:react/recommended"
  ],
  settings: {
    react: {
      pragma: "React",
      version: "detect"
    }
  }
};
