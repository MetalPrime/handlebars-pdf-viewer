async function generatePDF() {

    //avoid reload page
    event.preventDefault();

    const content = document.getElementById("content");
    if (!content) {
        console.error("Element with id 'content' not found.");
        return;
    }

    try {
        const response = await fetch("assets/data.json");
        if (!response.ok) {
            throw new Error('Failed to fetch data.json');
        }
        const data = await response.json();
        console.log('Fetched data:', data); // Log the fetched data

        const pdfResponse = await fetch('http://localhost:3000/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        event.preventDefault();

        if (!pdfResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const pdfBlob = await pdfResponse.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        console.log('Generated PDF URL:', pdfUrl);

        const pdfIframe = document.getElementById("pdf");
        if (!pdfIframe) {
            console.error("Element with id 'pdf' not found.");
            return;
        }

        pdfIframe.src = pdfUrl;

        // Open the generated PDF URL in a new tab for verification
        window.open(pdfUrl, '_blank');
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
}
