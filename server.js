"use strict";

const express = require("express");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const session = require("express-session");
// const csrf = require('csurf');
const consolidate = require("consolidate"); // Templating library adapter for Express
const swig = require("swig");
const helmet = require("helmet"); // A5 Fix: Enable helmet for security headers
const MongoClient = require("mongodb").MongoClient; // Driver for connecting to MongoDB
const http = require("http");
const marked = require("marked");
const app = express(); // Web framework to handle routing requests
const routes = require("./app/routes");
const { port, db, cookieSecret } = require("./config/config"); // Application config properties
/*
// Fix for A6-Sensitive Data Exposure
// Load keys for establishing secure HTTPS connection
const fs = require("fs");
const https = require("https");
const path = require("path");
const httpsOptions = {
    key: fs.readFileSync(path.resolve(__dirname, "./artifacts/cert/server.key")),
    cert: fs.readFileSync(path.resolve(__dirname, "./artifacts/cert/server.crt"))
};
*/

MongoClient.connect(db, (err, db) => {
    if (err) {
        console.log("Error: DB: connect");
        console.log(err);
        process.exit(1);
    }
    console.log(`Connected to the database`);

    // A5 Fix: Security Headers Configuration
    // Remove default x-powered-by response header
    app.disable("x-powered-by");

    // A5 Fix: Enable helmet with comprehensive security headers
    app.use(helmet({
        // Prevent clickjacking by disabling framing
        frameguard: { action: 'deny' },
        // Content Security Policy
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                imgSrc: ["'self'", "data:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                objectSrc: ["'none'"],
                frameAncestors: ["'none'"]
            }
        },
        // HTTP Strict Transport Security
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true
        },
        // Prevent MIME type sniffing
        noSniff: true,
        // XSS filter
        xssFilter: true,
        // Referrer Policy
        referrerPolicy: { policy: 'origin-when-cross-origin' }
    }));

    // Adding/ remove HTTP Headers for security
    app.use(favicon(__dirname + "/app/assets/favicon.ico"));

    // Express middleware to populate "req.body" so we can access POST variables
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        // Mandatory in Express v4
        extended: false
    }));

    // Enable session management using express middleware
    // A5 Fix: Hardened session configuration
    app.use(session({
        secret: cookieSecret,
        saveUninitialized: false,
        resave: false,
        name: "sessionId", // A5 Fix: Use generic cookie name
        cookie: {
            httpOnly: true, // A5 Fix: Prevent client-side JS access
            secure: process.env.NODE_ENV === "production", // A5 Fix: HTTPS only in production
            sameSite: "strict", // A5 Fix: Prevent CSRF via cookies
            maxAge: 30 * 60 * 1000 // A5 Fix: 30 minute session timeout
        }
    }));

    /*
    // Fix for A8 - CSRF
    // Enable Express csrf protection
    app.use(csrf());
    // Make csrf token available in templates
    app.use((req, res, next) => {
        res.locals.csrftoken = req.csrfToken();
        next();
    });
    */

    // Register templating engine
    app.engine(".html", consolidate.swig);
    app.set("view engine", "html");
    app.set("views", `${__dirname}/app/views`);
    // Fix for A5 - Security MisConfig
    // TODO: make sure assets are declared before app.use(session())
    app.use(express.static(`${__dirname}/app/assets`));


    // Initializing marked library
    // Fix for A9 - Insecure Dependencies
    marked.setOptions({
        sanitize: true
    });
    app.locals.marked = marked;

    // Application routes
    routes(app, db);

    // Template system setup
    // A5 Fix: Enable autoescape to prevent XSS
    swig.setDefaults({
        autoescape: true
    });

    // Insecure HTTP connection
    http.createServer(app).listen(port, () => {
        console.log(`Express http server listening on port ${port}`);
    });

    /*
    // Fix for A6-Sensitive Data Exposure
    // Use secure HTTPS protocol
    https.createServer(httpsOptions, app).listen(port, () => {
        console.log(`Express http server listening on port ${port}`);
    });
    */

});
