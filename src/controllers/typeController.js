const axios = require("axios");
const { Type } = require("../db");
require("dotenv").config();
const apiUrl = process.env.API_URL;

const loadTypesFromApi = async () => {
  // get types from API
  let allTypes = (await axios(`${apiUrl}/type`)).data.results;
  allTypes = allTypes.map((e) => e.name);

  let createdCount = 0;
  let foundCount = 0;

  // save types in DB
  for (const typeName of allTypes) {
    const [type, created] = await Type.findOrCreate({
      where: { name: typeName },
    });

    if (created) {
      createdCount++;
    } else {
      foundCount++;
    }
  }

  console.log(`${createdCount} types created`);
  console.log(`${foundCount} types found in DB`);
};

const getAllTypes = async () => {
  return await Type.findAll();
};

module.exports = {
  loadTypesFromApi,
  getAllTypes,
};
