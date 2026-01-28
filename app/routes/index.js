const SessionHandler = require("./session");
const ProfileHandler = require("./profile");
const BenefitsHandler = require("./benefits");
const ContributionsHandler = require("./contributions");
const AllocationsHandler = require("./allocations");
const MemosHandler = require("./memos");
const ResearchHandler = require("./research");
const tutorialRouter = require("./tutorial");
const ErrorHandler = require("./error").errorHandler;

const index = (app, db) => {

    "use strict";

    const sessionHandler = new SessionHandler(db);
    const profileHandler = new ProfileHandler(db);
    const benefitsHandler = new BenefitsHandler(db);
    const contributionsHandler = new ContributionsHandler(db);
    const allocationsHandler = new AllocationsHandler(db);
    const memosHandler = new MemosHandler(db);
    const researchHandler = new ResearchHandler(db);

    // Middleware to check if a user is logged in
    const isLoggedIn = sessionHandler.isLoggedInMiddleware;

    //Middleware to check if user has admin rights
    const isAdmin = sessionHandler.isAdminUserMiddleware;

    // The main page of the app
    app.get("/", sessionHandler.displayWelcomePage);

    // Login form
    app.get("/login", sessionHandler.displayLoginPage);
    app.post("/login", sessionHandler.handleLoginRequest);

    // Signup form
    app.get("/signup", sessionHandler.displaySignupPage);
    app.post("/signup", sessionHandler.handleSignup);

    // Logout page
    app.get("/logout", sessionHandler.displayLogoutPage);

    // The main page of the app
    app.get("/dashboard", isLoggedIn, sessionHandler.displayWelcomePage);

    // Profile page
    app.get("/profile", isLoggedIn, profileHandler.displayProfile);
    app.post("/profile", isLoggedIn, profileHandler.handleProfileUpdate);

    // Contributions Page
    app.get("/contributions", isLoggedIn, contributionsHandler.displayContributions);
    app.post("/contributions", isLoggedIn, contributionsHandler.handleContributionsUpdate);

    // Benefits Page
    app.get("/benefits", isLoggedIn, benefitsHandler.displayBenefits);
    app.post("/benefits", isLoggedIn, benefitsHandler.updateBenefits);
    /* Fix for A7 - checks user role to implement  Function Level Access Control
     app.get("/benefits", isLoggedIn, isAdmin, benefitsHandler.displayBenefits);
     app.post("/benefits", isLoggedIn, isAdmin, benefitsHandler.updateBenefits);
     */

    // Allocations Page
    app.get("/allocations/:userId", isLoggedIn, allocationsHandler.displayAllocations);

    // Memos Page
    app.get("/memos", isLoggedIn, memosHandler.displayMemos);
    app.post("/memos", isLoggedIn, memosHandler.addMemos);

    // A10 Fix: Whitelist-based redirect validation
    const ALLOWED_REDIRECT_DOMAINS = [
        "owasp.org",
        "nodejs.org",
        "expressjs.com",
        "mongodb.com",
        "npmjs.com"
    ];

    const ALLOWED_INTERNAL_PATHS = [
        "/dashboard",
        "/profile",
        "/tutorial",
        "/contributions",
        "/allocations"
    ];

    const isValidRedirect = (url) => {
        if (!url) return false;

        // Allow internal paths (must start with / but not //)
        if (url.startsWith("/") && !url.startsWith("//")) {
            return ALLOWED_INTERNAL_PATHS.some(path => url.startsWith(path));
        }

        // Validate external URLs against whitelist
        try {
            const parsedUrl = new URL(url);
            // Only allow http and https protocols
            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                return false;
            }
            return ALLOWED_REDIRECT_DOMAINS.some(domain =>
                parsedUrl.hostname === domain ||
                parsedUrl.hostname.endsWith("." + domain)
            );
        } catch {
            return false;
        }
    };

    // Handle redirect for learning resources link
    app.get("/learn", isLoggedIn, (req, res) => {
        const targetUrl = req.query.url;

        if (!isValidRedirect(targetUrl)) {
            console.log(`Blocked redirect attempt to: ${targetUrl}`);
            return res.status(400).send(
                "Invalid redirect URL. Only approved learning resources are allowed."
            );
        }

        return res.redirect(targetUrl);
    });

    // Research Page
    app.get("/research", isLoggedIn, researchHandler.displayResearch);

    // Mount tutorial router
    app.use("/tutorial", tutorialRouter);

    // Error handling middleware
    app.use(ErrorHandler);
};

module.exports = index;
