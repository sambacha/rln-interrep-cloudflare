import express from "express";
import { init, getWitness, register, getLeaves } from "./semaphore";
import { serializeWitness } from "./utils";
// init express
const app = express();
const port = 8084;
app.use(express.json());

// init semaphore
init();

app.get("/", (req, res) => {
  res.send("Welcome to InterRep mock.");
});

app.get("/witness/:index", (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);

    const witness = getWitness(index);
    res.json(serializeWitness(witness));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/register", (req, res) => {
  try {
    const identityCommitment = BigInt(req.body.identity);
    const index = register(identityCommitment);
    const witness = getWitness(index);
    res.json({ index, witness: serializeWitness(witness) });
  } catch (e: any) {
    if (e.message === "User already registered") {
      res.status(400);
    } else {
      res.status(500);
    }
    res.json({ error: e.message });
  }
});

app.get("/leaves", (req, res) => {
  try {
    const leaves = getLeaves().map((leaf) => leaf.toString());
    res.json(leaves);
  } catch (e: any) {
    res.json({ error: e.message });
  }
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
