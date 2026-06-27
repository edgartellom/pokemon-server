const axios = require("axios");
const { Pokemon, Type } = require("../db");
const { parsePokeInfo, parsePokemon, validateImage } = require("./utils");
require("dotenv").config();

const pokemonUrl = process.env.API_URL;

let cachedApi = null;
let cachedApiCount = null;

const getApiData = async () => {
  if (cachedApi) return cachedApi;

  const { data } = await axios.get(`${pokemonUrl}/pokemon?limit=2000`);

  const results = await parsePokeInfo(data.results);

  cachedApi = results;
  cachedApiCount = data.count;

  return results;
};

const getDbData = async () => {
  return await Pokemon.findAll({
    include: {
      model: Type,
      attributes: ["name"],
      through: { attributes: [] },
    },
  });
};

const getAllPokemons = async (query) => {
  let {
    page = 1,
    limit = 12,
    name,
    type,
    source, // "api" | "db" | undefined
    sort, // "name" | "attack"
    order = "asc",
  } = query;

  page = Number(page);
  limit = Number(limit);

  const [dbData, apiData] = await Promise.all([getDbData(), getApiData()]);

  let data = [...dbData, ...apiData];

  // ======================
  // SEARCH BY NAME
  // ======================
  if (name) {
    data = data.filter((p) =>
      p.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  // ======================
  // FILTER BY TYPE
  // ======================
  if (type) {
    data = data.filter((p) => p.types?.some((t) => t.name === type));
  }

  // ======================
  // FILTER BY ORIGIN
  // ======================
  if (source === "created") {
    data = data.filter((p) => p.createdInDb);
  }

  if (source === "api") {
    data = data.filter((p) => !p.createdInDb);
  }

  // ======================
  // SORT
  // ======================
  if (sort) {
    data.sort((a, b) => {
      const aVal = a[sort];
      const bVal = b[sort];

      if (order === "desc") {
        return aVal < bVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  }

  // ======================
  // PAGINATION
  // ======================
  const start = (page - 1) * limit;
  const end = start + limit;

  const paginated = data.slice(start, end);

  return {
    page,
    limit,
    count: data.length,
    totalPages: Math.ceil(data.length / limit),
    results: paginated,
  };
};

const getPokemonById = async (id) => {
  if (!isNaN(id)) {
    const { data } = await axios.get(`${pokemonUrl}/pokemon/${id}`);
    return parsePokemon(data);
  }

  return await Pokemon.findByPk(id, {
    include: {
      model: Type,
      attributes: ["name"],
      through: { attributes: [] },
    },
  });
};

const createPokemon = async ({
  name,
  hp,
  attack,
  defense,
  speed,
  height,
  weight,
  img,
  type,
}) => {
  img = await validateImage(img);

  const pokemon = await Pokemon.create({
    name,
    hp,
    attack,
    defense,
    speed,
    height,
    weight,
    img,
  });

  const types = await Type.findAll({
    where: {
      name: type,
    },
  });

  await pokemon.addTypes(types);

  return await Pokemon.findByPk(pokemon.id, {
    include: {
      model: Type,
      attributes: ["name"],
      through: {
        attributes: [],
      },
    },
  });
};

module.exports = {
  getAllPokemons,
  getPokemonById,
  createPokemon,
};
