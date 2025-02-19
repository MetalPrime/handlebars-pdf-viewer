const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-creator-node');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/assets', express.static(path.join(__dirname, 'assets'))); // Serve static files from assets

app.post('/generate-pdf', async (req, res) => {
    const data = req.body;

    const html = fs.readFileSync(path.join(__dirname, 'assets/template.handlebars'), 'utf8');
    const options = {
        format: 'A4',
        orientation: 'portrait',
        border: '10mm',
    };

    const document = {
        html: html,
        data: data,
        path: './output.pdf',
        type: '',
    };

    try {
        await pdf.create(document, options);
        res.sendFile(path.join(__dirname, 'output.pdf'));
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});