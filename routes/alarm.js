const Router = require("express").Router;
const Alarm = require("../model/alarm");
const User = require("../model/user");

const alarmRouter = Router();

alarmRouter.post("/", async (req, res) => {
  try {
    const { active, time } = req.body;

    if (!(active !== undefined && time)) {
      res.status(400).send("All input is required");
    }
    const user = await User.findOne({ email: req.user.email });

    const alarm = await Alarm.create({
      active,
      time,
      user: user,
    });

    console.log(alarm);

    res.status(201).json(alarm);
  } catch (err) {
    console.log(err);
  }
});

alarmRouter.put("/", async (req, res) => {
  try {
    const { active, time, id } = req.body;

    if (!(active !== undefined && time && id)) {
      res.status(400).send("All input is required");
    }

    const alarm = await Alarm.findByIdAndUpdate(
      id,
      {
        active,
        time,
      },
      { new: true }
    );

    res.json(alarm);
  } catch (err) {
    console.log(err);
  }
});

alarmRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Id is needed");
    }

    const alarm = await Alarm.findByIdAndDelete(id);
    res.json(alarm);
  } catch (err) {
    console.log(err);
  }
});

alarmRouter.get("/", async (req, res) => {
  try {
    const alarm = await Alarm.find({ user: req.user.user_id });
    res.json(alarm);
  } catch (err) {
    console.log(err);
  }
});

module.exports = alarmRouter;
