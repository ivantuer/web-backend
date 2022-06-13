const Router = require("express").Router;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const verifyToken = require("../middlewares/auth");
const User = require("../model/user");

const authRouter = Router();

authRouter.post("/sign-up", async (req, res) => {
  try {
    const { name, email, password, gender, birthday } = req.body;

    if (!(email && password && name && gender && birthday)) {
      res.status(400).send("All input is required");
    }

    const isExist = await User.findOne({ email });

    if (isExist) {
      return res.status(409).send("User with such email already exists.");
    }

    encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      gender,
      birthday,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    const token = jwt.sign({ user_id: user._id, email }, config.tokenKey, {
      expiresIn: "7d",
    });

    user.token = token;
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ user_id: user._id, email }, config.tokenKey, {
        expiresIn: "7d",
      });

      user.token = token;
      res.status(200).json(user);
    }
    res.status(401).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

authRouter.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      res.status(400).send("No such user");
    }

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});

authRouter.post("/me", verifyToken, async (req, res) => {
  try {
    const { birthday, gender, name } = req.body;

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      {
        birthday,
        gender,
        name,
      },
      { new: true }
    );

    if (!user) {
      res.status(400).send("No such user");
    }

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});

module.exports = authRouter;
