import express from "express";
import payload from "payload";
import { resolve } from "path";

require("dotenv").config({
  path: resolve(__dirname, "../.env"),
});
const app = express();

// Redirect root to Admin panel
app.get("/", (_, res) => {
  res.redirect("/admin");
});

// Initialize Payload
payload.init({
  secret: process.env['PAYLOAD_SECRET'] || ``,
  express: app,
  onInit: () => {
    payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
  },
});

// Add your own express routes here
app.get('/collection/config/:slug', async (_, res) => {
  const collection = payload.config.collections.find(collection => collection.slug === _.params.slug)

  if (collection) {
    res.setHeader('content-type', 'application/json')
    res.send(collection)
  }
})

app.listen(3000);
