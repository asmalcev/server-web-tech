import express from "express";
import bodyParser from "body-parser";
import { createReadStream } from "node:fs";
import crypto from "node:crypto";
import http from "node:http";
import pkg from "mongodb";
import proxy from "express-http-proxy";
import pug from "pug";
import puppeteer from "puppeteer";

import appSrc from "./app.js";

const app = appSrc(
    express,
    bodyParser,
    createReadStream,
    crypto,
    http,
    pkg.MongoClient,
    proxy,
    pug,
    puppeteer,
);

app.listen(process.env.PORT);
