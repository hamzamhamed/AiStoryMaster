import { jsPDF } from "jspdf";
import type { Story } from "@shared/schema";

// PDF generation options
const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 20; // margins in mm
const CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN);

export async function generatePDF(story: Story): Promise<Buffer> {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set fonts
  doc.setFont("helvetica", "bold");

  // Add title
  doc.setFontSize(24);
  doc.text(story.title, PAGE_WIDTH / 2, MARGIN, { align: "center" });

  // Add theme and date
  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  
  const theme = story.theme.charAt(0).toUpperCase() + story.theme.slice(1);
  const dateStr = new Date(story.dateGenerated).toLocaleDateString();
  doc.text(`Theme: ${theme}`, MARGIN, MARGIN + 12);
  doc.text(`Generated: ${dateStr}`, MARGIN, MARGIN + 20);

  // Add setting if available
  if (story.setting) {
    doc.text(`Setting: ${story.setting}`, MARGIN, MARGIN + 28);
  }

  // Add characters if available
  let yPos = MARGIN + (story.setting ? 36 : 28);
  if (story.characters && story.characters.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Characters:", MARGIN, yPos);
    doc.setFont("helvetica", "normal");
    
    yPos += 8;
    for (const character of story.characters) {
      doc.text(`• ${character.name}${character.description ? `: ${character.description}` : ""}`, 
        MARGIN + 5, yPos);
      yPos += 7;
    }
    yPos += 5;
  } else {
    yPos += 10;
  }

  // Add story content
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  
  // Process content with proper line breaks and pagination
  const paragraphs = story.content.split("\n\n");
  
  for (const paragraph of paragraphs) {
    // Check if we need a new page
    if (yPos > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      yPos = MARGIN;
    }
    
    // Split paragraph into lines that fit the page width
    const lines = doc.splitTextToSize(paragraph, CONTENT_WIDTH);
    
    // Add lines to document
    doc.text(lines, MARGIN, yPos);
    
    // Move y position for next paragraph (lines height + spacing)
    yPos += (lines.length * 7) + 5;
  }

  // Convert PDF to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}
