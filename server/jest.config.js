/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.test.js"],
  // Exclude the route integration test if supertest not installed
  testPathIgnorePatterns: ["/node_modules/"],
};
