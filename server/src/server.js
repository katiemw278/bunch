// Entry point that binds the port — kept separate from app.js so tests can
// import the Express app without triggering app.listen().
require("dotenv").config();
const app = require("./index");
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Bunch API listening on http://localhost:${PORT}`);
});
