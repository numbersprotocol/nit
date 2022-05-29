const nit = require("@numbersprotocol/nit");

async function main() {
  const configTemplate = nit.nitconfigTemplate;
  console.log(`${JSON.stringify(configTemplate)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
