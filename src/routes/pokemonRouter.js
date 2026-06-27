const { Router } = require("express");
const {
  getAllPokemons,
  getPokemonById,
  getPokemonByName,
  createPokemon,
} = require("../controllers/pokemonController");
const { Pokemon, Type } = require("../db");
const axios = require("axios");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await getAllPokemons(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const pokemon = await getPokemonById(id);

    if (!pokemon) {
      return res.status(404).send("Pokemon not found!");
    }

    res.status(200).json(pokemon);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const pokemon = await createPokemon(req.body);
    res.status(201).json(pokemon);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const pokemon = await Pokemon.findByPk(id);

    if (!pokemon) {
      return res.status(404).send("Pokemon not found!");
    }

    await pokemon.destroy();

    res.status(200).json(pokemon);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
