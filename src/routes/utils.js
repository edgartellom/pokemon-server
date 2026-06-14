const DEFAULT_IMAGE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png";

async function validateImage(url) {
  if (!url || url.trim() === "") {
    return DEFAULT_IMAGE;
  }

  try {
    await axios.head(url);
    return url;
  } catch (error) {
    return DEFAULT_IMAGE;
  }
}

module.exports = {
  validateImage,
};
