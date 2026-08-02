const PDFDocument = require("pdfkit");
const { parse } = require("json2csv");
const ReportModel = require("../models/report.model");

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const MOVEMENT_LABELS = { "stock-in": "Stock In", "stock-out": "Stock Out" };

function generateMovementCsv(rows) {
  const body = rows.map((row) => ({
    Date: new Date(row.created_at).toLocaleString(),
    Product: row.product_name,
    SKU: row.sku,
    Type: MOVEMENT_LABELS[row.type] ?? row.type,
    Quantity: row.quantity,
    Party: row.party ?? "",
    Reference: row.reference_number ?? "",
    Notes: row.notes ?? "",
  }));

  let csv = `StockFlow ${MOVEMENT_LABELS[rows[0]?.type] ?? "Movement"} Report\nGenerated On,${new Date().toLocaleString()}\nEntries,${rows.length}\n\n`;
  if (rows.length > 0) {
    csv += parse(body, { header: true });
  }
  return csv;
}

async function generatePdf(scope = "catalog") {
  if (scope === "stock-in" || scope === "stock-out") {
    return generateMovementPdf(scope);
  }
  const [products, summary] = await Promise.all([
    ReportModel.getInventorySnapshot(),
    ReportModel.getSummary(),
  ]);

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  doc.fontSize(18).fillColor("#1E293B").text("StockFlow Inventory Report", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#64748B").text(
    `Generated on ${new Date().toLocaleString()} · ${summary.total} products · ${formatCurrency(summary.value)} total value`,
    { align: "center" }
  );
  doc.moveDown(0.6);
  doc.fontSize(10).fillColor("#334155").text(
    `In stock: ${summary.total - summary.low - summary.out_of_stock} · Low stock: ${summary.low} · Out of stock: ${summary.out_of_stock} · Total units: ${summary.units}`
  );
  doc.moveDown(1);

  doc.fontSize(12).fillColor("#0F172A").text("Product Catalog");
  doc.moveDown(0.3);

  const tableTop = doc.y;
  const columns = [
    { label: "SKU", width: 70 },
    { label: "Product", width: 150 },
    { label: "Category", width: 85 },
    { label: "Stock", width: 45 },
    { label: "Status", width: 70 },
    { label: "Cost", width: 65 },
    { label: "Price", width: 65 },
  ];

  const drawHeader = (y) => {
    doc.fontSize(9).fillColor("#FFFFFF");
    let x = 40;
    columns.forEach((column) => {
      doc.rect(x, y, column.width, 18).fill("#2563EB");
      doc.fillColor("#FFFFFF").text(column.label, x + 6, y + 5, { width: column.width - 8 });
      x += column.width;
    });
    return y + 18;
  };

  let y = drawHeader(tableTop);
  doc.font("Helvetica");

  products.forEach((product, index) => {
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = drawHeader(40);
    }

    if (index % 2 === 0) {
      doc.rect(40, y, columns.reduce((sum, column) => sum + column.width, 0), 16).fill("#F1F5F9");
    }

    const values = [
      product.sku,
      product.name,
      product.category ?? "-",
      String(product.quantity),
      product.status.replace("-", " "),
      formatCurrency(product.purchase_price),
      formatCurrency(product.selling_price),
    ];

    let x = 40;
    doc.fontSize(8.5).fillColor("#0F172A");
    values.forEach((value, indexColumn) => {
      doc.text(String(value).slice(0, 22), x + 4, y + 4, {
        width: columns[indexColumn].width - 8,
      });
      x += columns[indexColumn].width;
    });
    y += 16;
  });

  doc.moveDown(0.5);
  doc.fontSize(9).fillColor("#64748B").text(
    `Total inventory value: ${formatCurrency(summary.value)} · Low stock threshold: below minimum stock level per product.`,
    { align: "center" }
  );

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

async function generateCsv(scope = "catalog") {
  if (scope === "stock-in" || scope === "stock-out") {
    const rows = await ReportModel.getStockMovements(scope);
    return generateMovementCsv(rows);
  }

  const [products, summary] = await Promise.all([
    ReportModel.getInventorySnapshot(),
    ReportModel.getSummary(),
  ]);

  const rows = products.map((product) => ({
    SKU: product.sku,
    Product: product.name,
    Category: product.category ?? "",
    Supplier: product.supplier ?? "",
    Stock: product.quantity,
    MinStock: product.min_stock,
    Status: product.status,
    PurchasePrice: product.purchase_price,
    SellingPrice: product.selling_price,
  }));

  const csv = parse(rows, { header: true });

  let summaryCsv = `StockFlow Inventory Report\nGenerated On,${new Date().toLocaleString()}\nTotal Products,${summary.total}\nTotal Value,${summary.value}\nLow Stock,${summary.low}\nOut of Stock,${summary.out_of_stock}\nTotal Units,${summary.units}\n\n`;
  return summaryCsv + csv;
}

async function generateMovementPdf(scope) {
  const rows = await ReportModel.getStockMovements(scope);
  const label = MOVEMENT_LABELS[scope];

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  doc.fontSize(18).fillColor("#1E293B").text(`StockFlow ${label} Report`, { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#64748B").text(
    `Generated on ${new Date().toLocaleString()} · ${rows.length} entries`,
    { align: "center" }
  );
  doc.moveDown(0.8);

  if (rows.length === 0) {
    doc.fontSize(11).fillColor("#334155").text("No entries recorded yet.");
    doc.end();
    return new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });
  }

  doc.fontSize(12).fillColor("#0F172A").text("Movements");
  doc.moveDown(0.3);

  const columns = [
    { label: "Date", width: 85 },
    { label: "Product", width: 150 },
    { label: "SKU", width: 60 },
    { label: "Qty", width: 40 },
    { label: "Party", width: 115 },
    { label: "Reference", width: 90 },
  ];

  const drawHeader = (y) => {
    doc.fontSize(9).fillColor("#FFFFFF");
    let x = 40;
    columns.forEach((column) => {
      doc.rect(x, y, column.width, 18).fill("#2563EB");
      doc.fillColor("#FFFFFF").text(column.label, x + 6, y + 5, { width: column.width - 8 });
      x += column.width;
    });
    return y + 18;
  };

  let y = drawHeader(doc.y);
  doc.font("Helvetica");

  rows.forEach((row, index) => {
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = drawHeader(40);
    }

    if (index % 2 === 0) {
      doc.rect(40, y, columns.reduce((sum, column) => sum + column.width, 0), 16).fill("#F1F5F9");
    }

    const values = [
      new Date(row.created_at).toLocaleDateString(),
      row.product_name,
      row.sku,
      String(row.quantity),
      row.party ?? "-",
      row.reference_number ?? "-",
    ];

    let x = 40;
    doc.fontSize(8.5).fillColor("#0F172A");
    values.forEach((value, indexColumn) => {
      doc.text(String(value).slice(0, 18), x + 4, y + 4, {
        width: columns[indexColumn].width - 8,
      });
      x += columns[indexColumn].width;
    });
    y += 16;
  });

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

module.exports = { generatePdf, generateCsv };
