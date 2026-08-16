const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).json({
    application: "cicd-lab-webapp",
    status: "ok",
    message: "CI/CD laboratory application 1"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Application listening on port ${PORT}`);
  });
}

module.exports = app;
