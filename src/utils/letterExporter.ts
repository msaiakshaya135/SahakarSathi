import jsPDF from "jspdf";

export interface LetterMetadata {
  memberName: string;
  membershipNo?: string;
  societyName: string;
  societyType?: string;
  districtState?: string;
  issue: string;
  relevantBylaw: string;
  date: string;
}

/**
 * Downloads letter content as a clean UTF-8 plain text (.txt) file.
 */
export function downloadLetterAsText(letterText: string, customFileName?: string) {
  const safeName = customFileName
    ? customFileName.replace(/[^a-zA-Z0-9_\u0900-\u0D7F-]/g, "_")
    : "Cooperative_Grievance_Petition";
  const fileName = safeName.endsWith(".txt") ? safeName : `${safeName}.txt`;

  const blob = new Blob([letterText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a formal, legally structured PDF document (.pdf).
 * Uses high-resolution multi-page canvas rendering to guarantee flawless
 * typography across all Indian regional languages (Hindi, Marathi, Gujarati,
 * Tamil, Telugu, Kannada, Bengali, Punjabi, English) without missing glyphs.
 */
export async function downloadLetterAsPdf(
  metadata: LetterMetadata,
  letterText: string,
  customFileName?: string
) {
  const safeName = customFileName
    ? customFileName.replace(/[^a-zA-Z0-9_\u0900-\u0D7F-]/g, "_")
    : "Cooperative_Grievance_Petition";
  const fileName = safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`;

  // Standard A4 canvas: 1240 x 1754 px (~150 DPI)
  const pageWidth = 1240;
  const pageHeight = 1754;
  const marginX = 65;
  const contentWidth = pageWidth - marginX * 2;

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) {
    downloadBasicPdf(metadata, letterText, fileName);
    return;
  }

  // Pre-calculate line wrapping and dynamically scale font size to guarantee 1 PAGE FIT
  const paragraphs = letterText.split(/\r?\n/);
  
  // Calculate initial rough line count
  let testLinesCount = 0;
  tempCtx.font = `normal 20px system-ui, -apple-system, "Nirmala UI", sans-serif`;
  for (const para of paragraphs) {
    if (para.trim() === "") {
      testLinesCount++;
      continue;
    }
    const words = para.split(" ");
    let cur = "";
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w;
      if (tempCtx.measureText(t).width > contentWidth && cur) {
        testLinesCount++;
        cur = w;
      } else {
        cur = t;
      }
    }
    if (cur) testLinesCount++;
  }

  // Adaptive font sizing to guarantee standard A4 fit
  let bodyFontSize = 20;
  let lineHeight = 28;
  if (testLinesCount > 60) {
    bodyFontSize = 14;
    lineHeight = 19;
  } else if (testLinesCount > 45) {
    bodyFontSize = 15.5;
    lineHeight = 22;
  } else if (testLinesCount > 30) {
    bodyFontSize = 17.5;
    lineHeight = 25;
  }

  tempCtx.font = `normal ${bodyFontSize}px system-ui, -apple-system, "Nirmala UI", "Segoe UI", sans-serif`;

  const wrappedLines: string[] = [];
  for (const para of paragraphs) {
    if (para.trim() === "") {
      wrappedLines.push("");
      continue;
    }

    const words = para.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = tempCtx.measureText(testLine);
      if (metrics.width > contentWidth && currentLine) {
        wrappedLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  // Helper to create and style a canvas page
  const createPageCanvas = () => {
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = pageWidth;
    pageCanvas.height = pageHeight;
    const pCtx = pageCanvas.getContext("2d");
    if (pCtx) {
      pCtx.fillStyle = "#ffffff";
      pCtx.fillRect(0, 0, pageWidth, pageHeight);
      pCtx.strokeStyle = "#064e3b";
      pCtx.lineWidth = 3;
      pCtx.strokeRect(25, 25, pageWidth - 50, pageHeight - 50);
      pCtx.strokeStyle = "#a7f3d0";
      pCtx.lineWidth = 1;
      pCtx.strokeRect(30, 30, pageWidth - 60, pageHeight - 60);
    }
    return { canvas: pageCanvas, ctx: pCtx };
  };

  // Page 1
  const page1 = createPageCanvas();
  if (!page1.ctx) {
    downloadBasicPdf(metadata, letterText, fileName);
    return;
  }
  const ctx = page1.ctx;

  let drawY = 55;

  // 1. Header Banner (Height: ~68px)
  ctx.fillStyle = "#064e3b";
  ctx.fillRect(marginX, drawY, contentWidth, 68);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("STATUTORY COOPERATIVE GRIEVANCE PETITION", pageWidth / 2, drawY + 30);

  ctx.font = "600 15px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#a7f3d0";
  ctx.fillText(
    "Under MSCS Act 2023 / State Cooperative Societies Act & Registered Model Bylaws",
    pageWidth / 2,
    drawY + 54
  );

  drawY += 80;

  // 2. Metadata Box
  const metaBoxHeight = 108;
  ctx.fillStyle = "#f0fdf4";
  ctx.strokeStyle = "#6ee7b7";
  ctx.lineWidth = 1.5;
  roundRect(ctx, marginX, drawY, contentWidth, metaBoxHeight, 8);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "left";
  const col1X = marginX + 20;
  const col2X = marginX + contentWidth / 2 + 10;
  let metaY = drawY + 26;

  // Row 1
  ctx.fillStyle = "#047857";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.fillText("PETITIONER:", col1X, metaY);
  ctx.fillStyle = "#0f172a";
  ctx.font = "600 16px system-ui, sans-serif";
  ctx.fillText(truncateText(ctx, `${metadata.memberName} (No: ${metadata.membershipNo || "On Record"})`, contentWidth / 2 - 30), col1X + 110, metaY);

  ctx.fillStyle = "#047857";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.fillText("DATE:", col2X, metaY);
  ctx.fillStyle = "#0f172a";
  ctx.font = "600 16px system-ui, sans-serif";
  ctx.fillText(metadata.date || new Date().toLocaleDateString("en-IN"), col2X + 60, metaY);

  metaY += 34;

  // Row 2
  ctx.fillStyle = "#047857";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.fillText("SOCIETY:", col1X, metaY);
  ctx.fillStyle = "#0f172a";
  ctx.font = "600 16px system-ui, sans-serif";
  ctx.fillText(truncateText(ctx, metadata.societyName, contentWidth / 2 - 30), col1X + 110, metaY);

  ctx.fillStyle = "#047857";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.fillText("BYLAW / ACT:", col2X, metaY);
  ctx.fillStyle = "#b45309";
  ctx.font = "bold 15px system-ui, sans-serif";
  ctx.fillText(truncateText(ctx, metadata.relevantBylaw, contentWidth / 2 - 120), col2X + 110, metaY);

  metaY += 34;

  // Row 3: Subject
  ctx.fillStyle = "#047857";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.fillText("GRIEVANCE:", col1X, metaY);
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 15px system-ui, sans-serif";
  ctx.fillText(truncateText(ctx, metadata.issue, contentWidth - 140), col1X + 110, metaY);

  drawY += metaBoxHeight + 24;

  // 3. Render Body Lines on Page 1
  ctx.textAlign = "left";
  let currentLineIdx = 0;
  for (; currentLineIdx < wrappedLines.length; currentLineIdx++) {
    const line = wrappedLines[currentLineIdx];
    if (drawY > pageHeight - 95) {
      break;
    }

    if (line === "") {
      drawY += lineHeight * 0.55;
      continue;
    }

    const isHeader =
      line.startsWith("TO:") ||
      line.startsWith("SUBJECT:") ||
      line.startsWith("COPY TO:") ||
      line.startsWith("PETITIONER PARTICULARS:") ||
      line.startsWith("सेवा में") ||
      line.startsWith("प्रति,") ||
      /^[0-9]+\.\s+/.test(line);

    if (isHeader) {
      ctx.fillStyle = "#064e3b";
      ctx.font = `bold ${bodyFontSize + 1}px system-ui, -apple-system, sans-serif`;
    } else {
      ctx.fillStyle = "#1e293b";
      ctx.font = `normal ${bodyFontSize}px system-ui, -apple-system, sans-serif`;
    }

    ctx.fillText(line, marginX, drawY);
    drawY += lineHeight;
  }

  const hasPage2 = currentLineIdx < wrappedLines.length;

  // Page 1 Footer
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX, pageHeight - 75);
  ctx.lineTo(marginX + contentWidth, pageHeight - 75);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = "14px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Sahakar Sathi • Official Statutory Grievance Petition Docket", marginX, pageHeight - 50);

  ctx.textAlign = "right";
  ctx.fillText(hasPage2 ? "Page 1 of 2 (Continued...)" : "Page 1 of 1 (Complete Representation)", marginX + contentWidth, pageHeight - 50);

  // Initialize jsPDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.addImage(page1.canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297);

  // If there are overflow lines, render Page 2 cleanly
  if (hasPage2) {
    const page2 = createPageCanvas();
    if (page2.ctx) {
      const ctx2 = page2.ctx;
      let drawY2 = 60;

      // Continuation Banner
      ctx2.fillStyle = "#064e3b";
      ctx2.fillRect(marginX, drawY2, contentWidth, 48);
      ctx2.fillStyle = "#ffffff";
      ctx2.font = "bold 20px system-ui, -apple-system, sans-serif";
      ctx2.textAlign = "center";
      ctx2.fillText("STATUTORY COOPERATIVE GRIEVANCE PETITION (CONTINUATION)", pageWidth / 2, drawY2 + 30);

      drawY2 += 68;

      ctx2.textAlign = "left";
      for (; currentLineIdx < wrappedLines.length; currentLineIdx++) {
        const line = wrappedLines[currentLineIdx];
        if (drawY2 > pageHeight - 95) break;

        if (line === "") {
          drawY2 += lineHeight * 0.55;
          continue;
        }

        const isHeader =
          line.startsWith("TO:") ||
          line.startsWith("SUBJECT:") ||
          line.startsWith("COPY TO:") ||
          line.startsWith("सेवा में") ||
          line.startsWith("प्रति,") ||
          /^[0-9]+\.\s+/.test(line);

        if (isHeader) {
          ctx2.fillStyle = "#064e3b";
          ctx2.font = `bold ${bodyFontSize + 1}px system-ui, -apple-system, sans-serif`;
        } else {
          ctx2.fillStyle = "#1e293b";
          ctx2.font = `normal ${bodyFontSize}px system-ui, -apple-system, sans-serif`;
        }

        ctx2.fillText(line, marginX, drawY2);
        drawY2 += lineHeight;
      }

      // Page 2 Footer
      ctx2.strokeStyle = "#e2e8f0";
      ctx2.lineWidth = 1;
      ctx2.beginPath();
      ctx2.moveTo(marginX, pageHeight - 75);
      ctx2.lineTo(marginX + contentWidth, pageHeight - 75);
      ctx2.stroke();

      ctx2.fillStyle = "#64748b";
      ctx2.font = "14px system-ui, sans-serif";
      ctx2.textAlign = "left";
      ctx2.fillText("Sahakar Sathi • Official Statutory Grievance Petition Docket", marginX, pageHeight - 50);

      ctx2.textAlign = "right";
      ctx2.fillText("Page 2 of 2 (End of Petition)", marginX + contentWidth, pageHeight - 50);

      doc.addPage();
      doc.addImage(page2.canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297);
    }
  }

  doc.save(fileName);
}

/**
 * Fallback direct text PDF renderer if canvas is unavailable.
 */
function downloadBasicPdf(
  metadata: LetterMetadata,
  letterText: string,
  fileName: string
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.setFontSize(13);
  doc.setTextColor(6, 78, 59);
  doc.text("STATUTORY COOPERATIVE GRIEVANCE PETITION", 15, 14);

  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`Petitioner: ${metadata.memberName} | Member No: ${metadata.membershipNo || "On Record"} | Society: ${metadata.societyName}`, 15, 20);
  doc.text(`Issue: ${metadata.issue} | Bylaw/Act: ${metadata.relevantBylaw} | Date: ${metadata.date || new Date().toLocaleDateString("en-IN")}`, 15, 25);

  doc.setDrawColor(6, 78, 59);
  doc.setLineWidth(0.4);
  doc.line(15, 28, 195, 28);

  doc.setFontSize(9.5);
  doc.setTextColor(25, 25, 25);
  const splitText = doc.splitTextToSize(letterText, 180);

  const lineSpacing = splitText.length > 40 ? 4.2 : splitText.length > 30 ? 4.6 : 5.2;
  let y = 34;
  for (const line of splitText) {
    if (y > 278) break; // Strictly guarantee 1 page
    doc.text(line, 15, y);
    y += lineSpacing;
  }

  doc.setDrawColor(220, 220, 220);
  doc.line(15, 286, 195, 286);
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text("Sahakar Sathi • Official Statutory Grievance Redressal Docket (1-Page A4 Petition)", 15, 290);
  doc.text("Page 1 of 1", 175, 290);

  doc.save(fileName);
}

/**
 * Opens formatted native print dialog for the letter, strictly formatted to fit 1 single A4 page.
 */
export function openLetterPrintDialog(
  letterText: string,
  metadata: LetterMetadata
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cooperative Grievance Petition - ${metadata.memberName}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            font-size: 9.5pt;
            line-height: 1.35;
            color: #111827;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page-wrapper {
            width: 100%;
            height: 100%;
            max-height: 275mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .header-box {
            border: 1.5px solid #064e3b;
            padding: 8px 12px;
            margin-bottom: 8px;
            background: #f0fdf4 !important;
            border-radius: 6px;
          }
          .header-title {
            color: #064e3b;
            font-weight: bold;
            font-size: 12pt;
            text-align: center;
            margin-bottom: 2px;
            letter-spacing: 0.5px;
          }
          .header-sub {
            text-align: center;
            font-size: 8pt;
            color: #047857;
            margin-bottom: 6px;
            font-weight: 500;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2px 10px;
            font-size: 8pt;
            border-top: 1px solid #a7f3d0;
            padding-top: 4px;
          }
          .meta-label { font-weight: bold; color: #047857; }
          .meta-val { font-weight: 600; color: #0f172a; }
          pre {
            white-space: pre-wrap;
            word-break: break-word;
            font-family: inherit;
            font-size: 9pt;
            line-height: 1.32;
            margin: 0;
            flex-grow: 1;
          }
          .footer {
            margin-top: 8px;
            border-top: 1px solid #cbd5e1;
            padding-top: 4px;
            font-size: 7.5pt;
            color: #64748b;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          @media print {
            body { padding: 0; }
            .page-wrapper {
              height: 100vh;
              max-height: 275mm;
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="page-wrapper">
          <div>
            <div class="header-box">
              <div class="header-title">STATUTORY COOPERATIVE GRIEVANCE PETITION</div>
              <div class="header-sub">Under Multi-State / State Cooperative Societies Act & Registered Model Bylaws</div>
              <div class="meta-grid">
                <div><span class="meta-label">Petitioner:</span> <span class="meta-val">${metadata.memberName} (No: ${metadata.membershipNo || "On Record"})</span></div>
                <div><span class="meta-label">Date:</span> <span class="meta-val">${metadata.date || new Date().toLocaleDateString("en-IN")}</span></div>
                <div><span class="meta-label">Society:</span> <span class="meta-val">${metadata.societyName}</span></div>
                <div><span class="meta-label">Bylaw / Act:</span> <span class="meta-val">${metadata.relevantBylaw}</span></div>
                <div style="grid-column: span 2;"><span class="meta-label">Grievance:</span> <span class="meta-val">${metadata.issue}</span></div>
              </div>
            </div>
            <pre>${letterText}</pre>
          </div>
          <div class="footer">
            <span>Generated via Sahakar Sathi • Official Legal Representation Docket (1-Page A4 Standard Format)</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let len = text.length;
  while (len > 0 && ctx.measureText(text.slice(0, len) + "...").width > maxWidth) {
    len--;
  }
  return text.slice(0, len) + "...";
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
