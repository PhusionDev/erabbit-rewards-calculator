const fs = require("fs");
// import { writeFile } from 'fs'; if you are using a typescript file

const environmentFile = `export const environment = {
  bscApiKey: '${process.env.BSC_ERABBIT_API_KEY}', // add here your variables
  production: ${process.env.PRODUCTION}
};
`;

//path.resolve(process.cwd(), /# etc. #/)
// Generate environment.ts file
fs.writeFile(
  "./src/environments/environment.ts",
  environmentFile,
  function (err) {
    if (err) {
      throw console.error(err);
    } else {
      console.log(`Angular environment.ts file generated`);
    }
  }
);
