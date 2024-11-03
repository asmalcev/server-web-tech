export default (
    express,
    bodyParser,
    createReadStream,
    crypto,
    http,
    MongoClient,
    proxy,
    pug,
    puppeteer,
) => {
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET,POST,PUT,DELETE,OPTIONS",
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "x-test,ngrok-skip-browser-warning,Content-Type,Accept,Access-Control-Allow-Headers",
        );
        next();
    });

    app.use(
        "/wordpress",
        proxy("http://51.250.114.52:8080", {
            userResHeaderDecorator(
                headers,
                userReq,
                userRes,
                proxyReq,
                proxyRes,
            ) {
                // recieves an Object of headers, returns an Object of headers.
                return {
                    ...headers,
                    ["Access-Control-Allow-Origin"]: "*",
                    ["Access-Control-Allow-Methods"]:
                        "GET,POST,PUT,DELETE,OPTIONS",
                    ["Access-Control-Allow-Headers"]:
                        "x-test,ngrok-skip-browser-warning,Content-Type,Accept,Access-Control-Allow-Headers",
                };
            },
        }),
    );

    app.all("/code/", (req, res) => {
        const reader = createReadStream(import.meta.url.substring(7), {
            encoding: "UTF-8",
        });

        const data = [];
        reader.on("data", (chunk) => data.push(chunk));
        reader.on("end", () => res.send(data.join()));
    });

    app.all("/sha1/:input", (req, res) => {
        res.send(
            crypto.createHash("sha1").update(req.params.input).digest("hex"),
        );
    });

    app.get("/req/", (req, res) => {
        http.get(req.query.addr, (response) => {
            const data = [];
            response.on("data", (chunk) => data.push(chunk));
            response.on("end", () => res.send(data.join()));
        });
    });

    app.post("/req/", (req, res) => {
        http.get(req.body.addr, (response) => {
            const data = [];
            response.on("data", (chunk) => data.push(chunk));
            response.on("end", () => res.send(data.join()));
        });
    });

    app.post("/insert/", (req, res) => {
        const { login, password, URL } = req.body;

        new MongoClient(URL)
            .connect()
            .then((client) => client.db("readusers"))
            .then((db) => db.collection("users"))
            .then((client) => client.insertOne({ login, password }))
            .then(() => res.send("OK"));
    });

    app.get("/id/:N", (req, res) => {
        http.get(`http://nd.kodaktor.ru/users/${req.params.N}`, (response) => {
            const data = [];
            res.removeHeader("Content-Type");
            response.on("data", (chunk) => data.push(chunk));
            response.on("end", () => res.send(data.join()));
        });
    });

    app.post("/render/", (req, res) => {
        console.log(req.query.addr);
        http.get(req.query.addr, (response) => {
            const data = [];
            response.on("data", (chunk) => data.push(chunk));
            response.on("end", () => {
                const file = data.join();

                const { random2, random3 } = req.body;

                const trimmedFile = file.slice(0, -2);

                res.send(
                    pug.compile(trimmedFile)({
                        random2,
                        random3,
                        login: "google.106893173198622652497",
                    }),
                );
            });
        });
    });

    app.get("/test/", async (req, res) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        console.log(req.query.URL);

        await page.goto(req.query.URL);

        await page.locator('#bt').click();
        const textInput = await page.locator('#inp').waitHandle();

        console.log(textInput);

        const text = await textInput?.evaluate(el => el.value);

        console.log(text);

        res.send(text);
    });

    app.all("*", (req, res) => res.send("google.106893173198622652497"));
    // app.all('*', (req, res) => res.send('asmalcev'));

    return app;
};
