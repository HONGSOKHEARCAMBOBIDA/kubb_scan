/**
 * Generates sample document images using HTML5 Canvas for instant demo testing.
 */
export function generateSampleDocument(title = 'Invoice #1042', type = 'invoice') {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');

  // Paper background with subtle texture
  ctx.fillStyle = '#fafaf9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  // Header banner
  ctx.fillStyle = type === 'invoice' ? '#1e3a8a' : '#047857';
  ctx.fillRect(60, 60, canvas.width - 120, 140);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(type === 'invoice' ? 'TAX INVOICE' : 'SERVICE AGREEMENT', 90, 145);

  ctx.font = '22px sans-serif';
  ctx.fillText('DocScanner Business Solutions Ltd.', 90, 175);

  // Document metadata
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(`Document: ${title}`, 90, 260);

  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 90, 295);
  ctx.fillText('Status: Verified & Stamped', 90, 325);

  // Divider line
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, 360);
  ctx.lineTo(canvas.width - 90, 360);
  ctx.stroke();

  // Content lines simulating document text
  ctx.fillStyle = '#334155';
  ctx.font = '22px sans-serif';

  const lines = [
    '1. Item Description: Professional Scanning & Document Processing Services',
    '2. Quantity: 1 Package | Rate: $120.00 | Total Amount: $120.00',
    '3. High Resolution PDF Archiving with Lossless Compression',
    '4. Terms & Conditions: All documents processed locally in browser storage.',
    '5. Conformance: ISO 19005-1 compliant document imaging standard.',
    '6. Notes: Confidential client file records. Authorized signatures below.',
    '7. Scanned via DocScanner Web Applet with Optical Geometry Correction.',
  ];

  let y = 430;
  for (const line of lines) {
    ctx.fillText(line, 90, y);
    y += 60;
  }

  // Table box
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(90, 880, canvas.width - 180, 260);
  ctx.strokeStyle = '#94a3b8';
  ctx.strokeRect(90, 880, canvas.width - 180, 260);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('SUMMARY & ACCOUNT DETAILS', 120, 930);

  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Subtotal: $120.00', 120, 980);
  ctx.fillText('Tax (8%): $9.60', 120, 1020);
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('Net Total Payable: $129.60', 120, 1080);

  // Stamp / Signature
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 4;
  ctx.strokeRect(canvas.width - 380, 1260, 260, 110);

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('APPROVED', canvas.width - 340, 1325);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('PAGE 1 OF 1 — VERIFIED DOCUMENT SCAN', 420, 1540);

  return canvas.toDataURL('image/jpeg', 0.94);
}
