const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-creator-node');
const cors = require('cors');
const Handlebars = require('handlebars'); // Import Handlebars

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/assets', express.static(path.join(__dirname, 'assets'))); // Serve static files from assets

//Get current date in the following format "Day, MM DDth, YYYY, at 00:00" at CET Timezone
function getCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'CET' };
    const date = new Date().toLocaleDateString('en-US', options);
    return date.replace(',', '');
}

//Register a helper to manage safe empty values
Handlebars.registerHelper("safeEmpty", function(options) {
    const value = options.fn(this);
    if(value === null) {
        return new Handlebars.SafeString("N/A");
    } else if (value === "") {
        return new Handlebars.SafeString("Not specified");
    } else {
        return value;
    }
});

//Register a helper to manage percentage data
Handlebars.registerHelper("percentage", function(options) {
    return new Handlebars.SafeString(`${options.fn(this)}%`);
});

//Register a helper to manage math operators
//taken from https://stackoverflow.com/questions/16315397/handlebars-js-how-to-do-a-simple-math-operation
Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
    
    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
});	

//Register a helper to manage date formatting
Handlebars.registerHelper("formatDate", function(options) {
    const date = new Date(options.fn(this));
    return date.toLocaleDateString();
});

//Register a helper to manage string content comparison
Handlebars.registerHelper("ifEquals", function(arg1, arg2, options) {
    if(arguments.length < 3) {
        throw new Error("Handlebars Helper ifEquals needs 2 parameters");
    }

    if(!(typeof arg1 === "string" || arg1 instanceof String) && !(typeof arg2 === "string" || arg2 instanceof String)) {
        throw new Error("Handlebars Helper ifEquals needs 2 string parameters");
    }

    arg1 = arg1.toString();
    arg2 = arg2.toString();

    if(arg1.localeCompare(arg2, 'en', {sensitivity: 'base'}) === 0) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

//Register a helper to check if a item is in a list
Handlebars.registerHelper("ifIn", function(item, list) {
    const listArr = (list ?? "").split(",");
    return listArr.includes(value.toString());
});

//Register a helper to check if a yes or no value is true
Handlebars.registerHelper("yesNoHelper", function(value, valueIfNotDefined) {
    if(arguments.length == 2) {
        return value == null ? valueIfNotDefined : value ? "Yes" : "No";
    }
    return value ? "Yes" : "No";
});

//Register a helper to add a conditional attribute
Handlebars.registerHelper("conditionalAttribute", function(originalValue,valueToCompare, attribute, valueIfTrue, valueIfFalse) {
    return `${attribute}="${originalValue == valueToCompare ? valueIfTrue : valueIfFalse}"`;
});

//Register a helper to add a safe string
Handlebars.registerHelper("safeString", function(value) {
    return new Handlebars.SafeString(value);
});

// Operator OR or  ||
Handlebars.registerHelper('or', function() {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
});

// Return the type of object passed in the variable
Handlebars.registerHelper('typeof', function(value) {
    return typeof value;
});

Handlebars.registerHelper("json", function(context) {
    return JSON.stringify(context, null, 2); // Pretty print
});

Handlebars.registerHelper('parseJSON', function(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Error parsing JSON:', e);
        return [];
    }
});

app.post('/generate-pdf', async (req, res) => {
    const data = req.body;
    data.timeCreation = getCurrentDate();

    const html = fs.readFileSync(path.join(__dirname, 'assets/template.handlebars'), 'utf8');
    const options = {
        format: 'A3',
        orientation: 'portrait',
        border: 0,
        base: 'file://' + path.join(__dirname, 'assets/'),
        header: {
            height: '40mm'
        },
        footer: {
            height: '30mm'
        },
        renderDelay: 3000,
        base: `file://${path.join(__dirname, 'assets')}/`,
        zoomFactor: 1,
        phantomPath: require('phantomjs-prebuilt').path,
        // Add specific PhantomJS options
        phantomArgs: ['--web-security=false', '--local-to-remote-url-access=true'],
        // Enable background graphics
        allowLocalFilesAccess: true,
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