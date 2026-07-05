import fs from "fs/promises";
import chalk from "chalk";
export const formatSwaggerJson = async () => {
  try {
    const swaggerJson = await fs.readFile("./swagger-output.json", "utf-8");
    const data = JSON.parse(swaggerJson);
    Object.keys(data.paths).forEach((route) => {
      let tempdata = route;
      let index = Object.keys(data.paths[route])[0];
      data.paths[route][index]["tags"] = [
        tempdata.slice(1, tempdata.slice(1).indexOf("/") + 1),
      ];
    });
    await fs.writeFile(
      "./swagger-output.json",
      JSON.stringify(data, null, 2),
      "utf8",
    );
    console.log(chalk.yellow("Swagger json formatted"));
  } catch (err) {
    console.log("error came");
    console.log(err.message);
  }
};
