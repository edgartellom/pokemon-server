const { Router } = require("express");
const { getAllPokemons } = require("../controllers/pokemonController");
const { Pokemon, Type } = require("../db");
const axios = require("axios");
const { validateImage } = require("./utils");
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { name } = req.query;
    let pokemonsTotal = await getAllPokemons();
    if (name) {
      let pokemonName = await pokemonsTotal.filter((e) =>
        e.name.toLowerCase().includes(name.toLowerCase()),
      );
      pokemonName.length
        ? res.status(200).send(pokemonName)
        : res.status(404).send("Pokemon not found!");
    } else {
      res.status(200).send(pokemonsTotal);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    let pokemonsTotal = await getAllPokemons();
    if (id) {
      let pokemonId = await pokemonsTotal.filter((e) => e.id == id);
      pokemonId.length
        ? res.status(200).send(pokemonId)
        : res.status(404).send("Pokemon not found!");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let { name, hp, attack, defense, speed, height, weight, img, type } =
      req.body;

    img = await validateImage(img);

    let pokemonCreated = await Pokemon.create({
      name,
      hp,
      attack,
      defense,
      speed,
      height,
      weight,
      img,
    });

    let typeDb = await Type.findAll({
      where: { name: type },
    });
    await pokemonCreated.addTypes(typeDb);

    res.send("Pokemon created succesfully!");
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    let pokemonsTotal = await getAllPokemons();
    if (id) {
      let pokemonId = await pokemonsTotal.filter((e) => e.id == id);
      await Pokemon.destroy({
        where: { id: id },
      });
      pokemonId.length
        ? res.status(200).send(pokemonId)
        : res.status(404).send("Pokemon not found!");
    }
    pokemonsTotal = pokemonsTotal.filter((e) => e.id != id);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
