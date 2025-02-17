function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const content = document.getElementById("content").innerText;
    doc.text(content, 10, 10);
    
    const pdfData = doc.output("datauristring");
    document.getElementById("pdf").src = pdfData;
}
