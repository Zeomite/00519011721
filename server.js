const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const testRouter = require("./routes/testRouter");
const passport = require("passport");


app.use(express.json());
app.use(passport.initialize())



app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.use("/test", testRouter );




const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on ${port}, http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
