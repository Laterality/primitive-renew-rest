"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
app.use((req, res) => {
    res.status(200);
    res.send("Server is on");
    res.end();
});
app.listen(3100, (err) => {
    if (err) {
        console.log("error occurred");
    }
});
