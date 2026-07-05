import swaggerAutogen from "swagger-autogen";
import { formatSwaggerJson } from "./swaggerjsonformater.js";
const doc = {
  openapi: "3.0.0", // Force 3.0 only
  info: { title: "Project Name API", version: "1.0.0" },
  servers: [{ url: "http://localhost:3000" }],
};
const outputFile = "../swagger-output.json";
const endpointsFiles = ["./app.js"]; // Include app.js for full route tree with prefix
let result = await swaggerAutogen({ openapi: "3.0.0" })(
  outputFile,
  endpointsFiles,
  doc,
);
console.log("Pure OpenAPI 3.0 generated!");
if (result.success) {
  formatSwaggerJson();
}
