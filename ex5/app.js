export default (express, bodyParser, createReadStream, crypto, http) => {
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader(
            'Access-Control-Allow-Methods',
            'GET,POST,PUT,DELETE,OPTIONS'
        );
        res.setHeader(
            'Access-Control-Allow-Headers',
            'x-test,ngrok-skip-browser-warning,Content-Type,Accept,Access-Control-Allow-Headers'
        );
        next();
    });

    app.all('/code/', (req, res) => {
        const reader = createReadStream(import.meta.url.substring(7), {
            encoding: 'UTF-8',
        });

        const data = [];
        reader.on('data', (chunk) => data.push(chunk));
        reader.on('end', () => res.send(data.join()));
    });

    app.all('/sha1/:input', (req, res) => {
        res.send(
            crypto.createHash('sha1').update(req.params.input).digest('hex')
        );
    });

    app.get('/req/', (req, res) => {
        http.get(req.query.addr, (response) => {
            const data = [];
            response.on('data', (chunk) => data.push(chunk));
            response.on('end', () => res.send(data.join()));
        });
    });

    app.post('/req/', (req, res) => {
        http.get(req.body.addr, (response) => {
            const data = [];
            response.on('data', (chunk) => data.push(chunk));
            response.on('end', () => res.send(data.join()));
        });
    });

    app.all('*', (req, res) => res.send('google.106893173198622652497'));

    return app;
};
