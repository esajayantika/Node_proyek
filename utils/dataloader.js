const fs = require("fs");

const loadSelection = () => {
  const file = fs.readFileSync("data/selection.json", "utf-8");
  const json = JSON.parse(file);
  return json;
};

module.exports = { loadSelection };
