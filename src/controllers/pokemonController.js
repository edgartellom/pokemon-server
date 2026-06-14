const axios = require("axios");
const { Pokemon, Type } = require("../db");
require("dotenv").config();
const apiUrl = process.env.API_URL;
const initialPokemon = 0;
const pokemonAmount = 1350;
const pokemonPlaceholder =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png";

const loadPokemonsFromApi = async () => {
  // get pokemons from API
  const response = await axios(
    `${apiUrl}/pokemon?offset=${initialPokemon}&limit=${pokemonAmount}`,
  );

  // parse and save pokemons in DB
  let createdCount = 0;
  let foundCount = 0;

  for (const pokemonInfo of response.data.results) {
    let { name, stats, height, weight, sprites, types } = (
      await axios(pokemonInfo.url)
    ).data;

    const typeNames = types.map((t) => t.type.name);
    const hp = stats.find((e) => e.stat.name === "hp").base_stat;
    const attack = stats.find((e) => e.stat.name === "attack").base_stat;
    const defense = stats.find((e) => e.stat.name === "defense").base_stat;
    const speed = stats.find((e) => e.stat.name === "speed").base_stat;
    const img = sprites.front_default || pokemonPlaceholder;

    const [pokemon, created] = await Pokemon.findOrCreate({
      where: { name },
      defaults: {
        name,
        hp,
        attack,
        defense,
        speed,
        height,
        weight,
        img,
        fromApi: true,
      },
    });

    let typeDb = await Type.findAll({
      where: { name: typeNames },
    });
    await pokemon.addTypes(typeDb);

    if (created) {
      createdCount++;
    } else {
      foundCount++;
    }
  }

  console.log(`${createdCount} pokemons created`);
  console.log(`${foundCount} pokemons found in DB`);
};

const getAllPokemons = async () => {
  return await Pokemon.findAll({
    include: [
      {
        model: Type,
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
  });
};

module.exports = {
  loadPokemonsFromApi,
  getAllPokemons,
};
