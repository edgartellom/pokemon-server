const axios = require("axios");
const pokemonPlaceholder =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png";

const parsePokemon = (data) => {
  const { id, name, stats, height, weight, sprites, types } = data;

  const statsMap = Object.fromEntries(
    stats.map((s) => [s.stat.name, s.base_stat]),
  );

  return {
    id,
    name,
    hp: statsMap.hp,
    attack: statsMap.attack,
    defense: statsMap.defense,
    speed: statsMap.speed,
    height,
    weight,
    img: sprites.other["official-artwork"].front_default || pokemonPlaceholder,
    types: types.map((t) => ({ name: t.type.name })),
  };
};

const parsePokeInfo = async (results) => {
  let pokemons = [];

  for (const pokemon of results) {
    try {
      const { data } = await axios.get(pokemon.url);
      pokemons.push(parsePokemon(data));
    } catch (err) {
      console.error("Error fetching:", pokemon.url, err.message);
    }
  }

  return pokemons;
};

const validateImage = async (url) => {
  if (!url || url.trim() === "") {
    return pokemonPlaceholder;
  }

  try {
    await axios.get(url, {
      timeout: 5000,
    });
    return url;
  } catch {
    return pokemonPlaceholder;
  }
};

module.exports = {
  parsePokeInfo,
  parsePokemon,
  validateImage,
};
