document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("assets/data.json");
    const data = await response.json();

    const templateResponse = await fetch("assets/template.handlebars");
    const templateText = await templateResponse.text();
    const template = Handlebars.compile(templateText);

    document.getElementById("content").innerHTML = template(data);
});