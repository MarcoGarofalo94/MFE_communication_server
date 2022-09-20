const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const port = 4000;
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.post("/generateHash", (req, res) => {
  let mfs = {};
  let copy = [...req.body];
  for (let i = 0; i < req.body.length; i++) {
    mfId = req.body[i].id;
    let hash = require("crypto")
      .createHash("md5")
      .update(JSON.stringify(req.body[i])+Date.now())
      .digest("hex");

    copy[i] = { ...copy[i], hash: hash };
    mfs[mfId] = hash;
  }
  console.log(copy);
  fs.writeFileSync("./associations.json", JSON.stringify(copy));
  res.send(copy);
});

app.post("/checkPublisherHash", (req, res) => {
  console.log(req.body);
  const associations = JSON.parse(
    fs.readFileSync("./associations.json", { encoding: "utf-8" })
  );
  console.log(associations);
  const mf = associations.find((a) => {
    return (
      a.id == req.body.mfId &&
      a.hash == req.body.hash &&
      a.emitting.find((event) => event == req.body.eventId) != undefined
    );
  });
  if (mf != undefined) {
    console.log(
      req.body.mfId + " is allowed to emit event " + req.body.eventId
    );
    res.send({
      success: true,
      message:
        req.body.mfId + " is allowed to emit event " + req.body.eventId,
    });
  } else {
    console.log(
      req.body.mfId + " is not allowed to emit event " + req.body.eventId
    );
    res.send({
      success: false,
      message:
        req.body.mfId + " is not allowed to emit event " + req.body.eventId,
    });
  }
});

app.post("/checkSubscriberHash", (req, res) => {
  console.log(req.body);
  const associations = JSON.parse(
    fs.readFileSync("./associations.json", { encoding: "utf-8" })
  );
  console.log(associations);
  const mf = associations.find((a) => {
    return (
      a.id == req.body.mfId &&
      a.hash == req.body.hash &&
      a.listening.find((event) => event == req.body.eventId) != undefined
    );
  });
  if (mf != undefined) {
    console.log(
      req.body.mfId + " is allowed to listen event " + req.body.eventId
    );
    res.send({
      success: mf != undefined,
      message:
        req.body.mfId + " is allowed to listen event " + req.body.eventId,
    });
  } else {
    console.log(
      req.body.mfId + " is not allowed to listen event " + req.body.eventId
    );
    res.send({
      success: mf != undefined,
      message:
        req.body.mfId + " is not allowed to listen event " + req.body.eventId,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
