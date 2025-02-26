document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("assets/data.json");
    const data = await response.json();

    //Register a helper to manage safe empty values
    Handlebars.registerHelper("safeEmpty", function(options) {
        const value = options.fn(this);
        if(value === null) {
            return new Handlebars.SafeString("N/A");
        } else if (value === "") {
            return new Handlebars.SafeString("Not provided");
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

    const templateResponse = await fetch("assets/template.handlebars");
    const templateText = await templateResponse.text();
    const template = Handlebars.compile(templateText);

    document.getElementById("content").innerHTML = template(data);
});