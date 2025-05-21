const express = require('express');
const app = express();
const fs = require('fs');
const port = process.env.PORT || 3030;
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static('public'));

app.use("/js", express.static("./scripts"));
app.use("/css", express.static("./styles"));
app.use("/img", express.static("./image"));

// Basic route
app.get("/", function(req, res) {
    let doc = fs.readFileSync("./index.html", "utf8");
    res.send(doc);
});

app.use((req, res) => {
    res.status(404).send('Page not found - 404');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});