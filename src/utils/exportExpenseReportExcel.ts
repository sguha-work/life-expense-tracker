import ExcelJS from 'exceljs';
import { Chart, registerables } from 'chart.js';
import type { Expense, Category } from '../interfaces';

Chart.register(...registerables);

const INR_FMT = '"₹"#,##0.00';
const CHART_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#16a34a',
  '#0891b2',
  '#ca8a04',
  '#4f46e5',
  '#0d9488',
  '#be123c',
];

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function styleHeaderRow(row: ExcelJS.Row): void {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
}

function styleSubHeaderRow(row: ExcelJS.Row): void {
  row.font = { bold: true };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E7FF' },
  };
}

function styleTotalRow(row: ExcelJS.Row): void {
  row.font = { bold: true };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFEF3C7' },
  };
}

/** Monthly-equivalent limit for comparison with period spend (same as Budget exceeded sheet). */
function getMonthlyBudgetLimit(cat: Category): number {
  if (!cat.budgetAmount || cat.budgetAmount <= 0) return 0;
  if (cat.budgetMode === 'd') return cat.budgetAmount * 30;
  if (cat.budgetMode === 'y') return cat.budgetAmount / 12;
  return cat.budgetAmount;
}

function budgetModeLabel(cat: Category): string {
  if (cat.budgetMode === 'd') return 'Daily';
  if (cat.budgetMode === 'y') return 'Yearly';
  return 'Monthly';
}

/** Spending by category: one row per category (including ₹0), horizontal bars so every label fits. */
async function renderCategoryBarChartPng(
  labels: string[],
  values: number[],
  title: string
): Promise<{ base64: string; width: number; height: number }> {
  const canvas = document.createElement('canvas');
  const n = Math.max(1, labels.length);
  const rowPx = 36;
  canvas.width = 760;
  canvas.height = Math.min(2800, Math.max(360, 100 + n * rowPx));

  const chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Amount (INR)',
          data: values,
          backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderColor: '#1e40af',
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      animation: false,
      responsive: false,
      layout: { padding: { left: 4, right: 12, top: 8, bottom: 8 } },
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 14, weight: 'bold' },
        },
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: (v: string | number) => `₹${Number(v).toLocaleString('en-IN')}`,
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            autoSkip: false,
            font: { size: n > 20 ? 10 : 11 },
          },
        },
      },
    },
  });

  const dataUrl = canvas.toDataURL('image/png');
  chart.destroy();
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return { base64, width: canvas.width, height: canvas.height };
}

async function renderChartToPngBase64(
  type: 'pie',
  labels: string[],
  values: number[],
  title: string
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 520;
  canvas.height = 420;

  const chart = new Chart(canvas, {
    type,
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      animation: false,
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 14, weight: 'bold' },
        },
        legend: {
          display: true,
          position: 'right',
        },
      },
    },
  });

  const dataUrl = canvas.toDataURL('image/png');
  chart.destroy();
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return base64;
}

export async function exportExpenseReportExcel(
  expenses: Expense[],
  getCategoryName: (categoryId: string) => string,
  year: number,
  monthIndex: number,
  categories: Category[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Life Expense Tracker';

  const periodLabel = new Date(year, monthIndex, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const fileSlug = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

  const sorted = [...expenses].sort((a, b) => a.createdAt - b.createdAt);
  const grandTotal = sorted.reduce((s, e) => s + e.amount, 0);

  // --- Sheet 1: All expenses ---
  const s1 = workbook.addWorksheet('All expenses', {
    views: [{ state: 'frozen', ySplit: 2 }],
  });
  s1.columns = [
    { width: 22 },
    { width: 36 },
    { width: 22 },
    { width: 18 },
    { width: 14 },
  ];
  s1.getRow(1).getCell(1).value = `Expense report — ${periodLabel}`;
  s1.mergeCells(1, 1, 1, 5);
  s1.getRow(1).font = { bold: true, size: 14 };
  s1.getRow(1).height = 22;

  const h1 = s1.getRow(2);
  h1.values = ['Date & time', 'Description', 'Category', 'Payment mode', 'Amount (INR)'];
  styleHeaderRow(h1);

  let row = 3;
  for (const e of sorted) {
    const r = s1.getRow(row);
    r.getCell(1).value = formatDateTime(e.createdAt);
    r.getCell(2).value = e.description;
    r.getCell(3).value = getCategoryName(e.categoryId);
    r.getCell(4).value = e.mode;
    r.getCell(5).value = e.amount;
    r.getCell(5).numFmt = INR_FMT;
    row++;
  }

  const totalRow = s1.getRow(row);
  totalRow.getCell(4).value = 'Total';
  totalRow.getCell(5).value = grandTotal;
  totalRow.getCell(5).numFmt = INR_FMT;
  styleTotalRow(totalRow);

  // --- Sheet 2: By category ---
  const s2 = workbook.addWorksheet('By category');
  s2.columns = [
    { width: 22 },
    { width: 36 },
    { width: 18 },
    { width: 14 },
  ];
  s2.getRow(1).getCell(1).value = `By category — ${periodLabel}`;
  s2.mergeCells(1, 1, 1, 4);
  s2.getRow(1).font = { bold: true, size: 14 };

  let r2 = 2;
  const byCat = new Map<string, Expense[]>();
  for (const e of sorted) {
    const name = getCategoryName(e.categoryId);
    const list = byCat.get(name) ?? [];
    list.push(e);
    byCat.set(name, list);
  }
  const catNames = [...byCat.keys()].sort((a, b) => a.localeCompare(b));

  for (const cat of catNames) {
    const list = byCat.get(cat)!;
    const catSum = list.reduce((s, e) => s + e.amount, 0);

    const titleRow = s2.getRow(r2);
    titleRow.getCell(1).value = cat;
    s2.mergeCells(r2, 1, r2, 4);
    titleRow.font = { bold: true, size: 12 };
    titleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDBEAFE' },
    };
    r2++;

    const subH = s2.getRow(r2);
    subH.values = ['Date & time', 'Description', 'Payment mode', 'Amount (INR)'];
    styleSubHeaderRow(subH);
    r2++;

    for (const e of list) {
      const rr = s2.getRow(r2);
      rr.getCell(1).value = formatDateTime(e.createdAt);
      rr.getCell(2).value = e.description;
      rr.getCell(3).value = e.mode;
      rr.getCell(4).value = e.amount;
      rr.getCell(4).numFmt = INR_FMT;
      r2++;
    }

    const subT = s2.getRow(r2);
    subT.getCell(2).value = `Total — ${cat}`;
    subT.getCell(4).value = catSum;
    subT.getCell(4).numFmt = INR_FMT;
    styleTotalRow(subT);
    r2 += 2;
  }

  if (catNames.length === 0) {
    s2.getRow(r2).getCell(1).value = 'No expenses in this period.';
    r2++;
  }

  // --- Sheet 3: By payment mode ---
  const s3 = workbook.addWorksheet('By payment mode');
  s3.columns = [
    { width: 22 },
    { width: 36 },
    { width: 22 },
    { width: 14 },
  ];
  s3.getRow(1).getCell(1).value = `By payment mode — ${periodLabel}`;
  s3.mergeCells(1, 1, 1, 4);
  s3.getRow(1).font = { bold: true, size: 14 };

  let r3 = 2;
  const byMode = new Map<string, Expense[]>();
  for (const e of sorted) {
    const list = byMode.get(e.mode) ?? [];
    list.push(e);
    byMode.set(e.mode, list);
  }
  const modes = [...byMode.keys()].sort((a, b) => a.localeCompare(b));

  for (const mode of modes) {
    const list = byMode.get(mode)!;
    const modeSum = list.reduce((s, e) => s + e.amount, 0);

    const titleRow = s3.getRow(r3);
    titleRow.getCell(1).value = mode;
    s3.mergeCells(r3, 1, r3, 4);
    titleRow.font = { bold: true, size: 12 };
    titleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDBEAFE' },
    };
    r3++;

    const subH = s3.getRow(r3);
    subH.values = ['Date & time', 'Description', 'Category', 'Amount (INR)'];
    styleSubHeaderRow(subH);
    r3++;

    for (const e of list) {
      const rr = s3.getRow(r3);
      rr.getCell(1).value = formatDateTime(e.createdAt);
      rr.getCell(2).value = e.description;
      rr.getCell(3).value = getCategoryName(e.categoryId);
      rr.getCell(4).value = e.amount;
      rr.getCell(4).numFmt = INR_FMT;
      r3++;
    }

    const subT = s3.getRow(r3);
    subT.getCell(2).value = `Total — ${mode}`;
    subT.getCell(4).value = modeSum;
    subT.getCell(4).numFmt = INR_FMT;
    styleTotalRow(subT);
    r3 += 2;
  }

  if (modes.length === 0) {
    s3.getRow(r3).getCell(1).value = 'No expenses in this period.';
    r3++;
  }

  // --- Sheet 4: Budget ---
  const sBudget = workbook.addWorksheet('Budget');
  sBudget.columns = [
    { width: 28 },
    { width: 12 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
  ];
  sBudget.getRow(1).getCell(1).value = `Budget — ${periodLabel}`;
  sBudget.mergeCells(1, 1, 1, 6);
  sBudget.getRow(1).font = { bold: true, size: 14 };

  const hBudget = sBudget.getRow(2);
  hBudget.values = [
    'Category',
    'Budget mode',
    'Budget (INR)',
    'Monthly limit (INR)',
    'Spent (INR)',
    'Gap (INR)',
  ];
  styleHeaderRow(hBudget);

  let rB = 3;
  const budgetCategories = categories
    .filter((c) => c.budgetAmount && c.budgetAmount > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const cat of budgetCategories) {
    const monthlyLimit = getMonthlyBudgetLimit(cat);
    const catSpent = expenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const gap = monthlyLimit - catSpent;

    const br = sBudget.getRow(rB);
    br.getCell(1).value = cat.name;
    br.getCell(2).value = budgetModeLabel(cat);
    br.getCell(3).value = cat.budgetAmount ?? 0;
    br.getCell(3).numFmt = INR_FMT;
    br.getCell(4).value = monthlyLimit;
    br.getCell(4).numFmt = INR_FMT;
    br.getCell(5).value = catSpent;
    br.getCell(5).numFmt = INR_FMT;
    br.getCell(6).value = gap;
    br.getCell(6).numFmt = INR_FMT;
    br.getCell(6).font = {
      bold: true,
      color: { argb: gap < 0 ? 'FFDC2626' : 'FF16A34A' },
    };
    rB++;
  }

  if (budgetCategories.length === 0) {
    sBudget.getRow(rB).getCell(1).value = 'No categories with a budget for this export.';
    sBudget.mergeCells(rB, 1, rB, 6);
    rB++;
  }

  // --- Sheet 5: Charts ---
  const s4 = workbook.addWorksheet('Charts');
  s4.getColumn(1).width = 14;
  let chartRow = 1;

  s4.getRow(chartRow).getCell(1).value = `Charts — ${periodLabel}`;
  s4.getRow(chartRow).font = { bold: true, size: 14 };
  chartRow += 2;

  if (sorted.length === 0) {
    s4.getRow(chartRow).getCell(1).value =
      'No expenses in this period — no charts generated.';
    chartRow += 2;
  } else {
    const spendByCategoryId = new Map<string, number>();
    for (const e of sorted) {
      spendByCategoryId.set(e.categoryId, (spendByCategoryId.get(e.categoryId) ?? 0) + e.amount);
    }

    const catTotals: { label: string; value: number }[] = [];
    const knownIds = new Set<string>();
    for (const c of categories) {
      if (!c.id) continue;
      knownIds.add(c.id);
      catTotals.push({
        label: c.name,
        value: spendByCategoryId.get(c.id) ?? 0,
      });
    }
    for (const [id, value] of spendByCategoryId) {
      if (!knownIds.has(id)) {
        catTotals.push({ label: getCategoryName(id), value });
      }
    }
    catTotals.sort((a, b) => b.value - a.value);

    const modeTotals: { label: string; value: number }[] = [];
    for (const m of modes) {
      const sum = byMode.get(m)!.reduce((s, e) => s + e.amount, 0);
      modeTotals.push({ label: m, value: sum });
    }
    modeTotals.sort((a, b) => b.value - a.value);

    const barChart = await renderCategoryBarChartPng(
      catTotals.map((c) => c.label),
      catTotals.map((c) => c.value),
      'Spending by category'
    );
    const barId = workbook.addImage({ base64: barChart.base64, extension: 'png' });
    let embedW = 640;
    let embedH = Math.round(embedW * (barChart.height / barChart.width));
    const maxEmbedH = 2000;
    if (embedH > maxEmbedH) {
      const scale = maxEmbedH / embedH;
      embedH = maxEmbedH;
      embedW = Math.round(embedW * scale);
    }
    embedH = Math.max(280, embedH);
    s4.addImage(barId, {
      tl: { col: 0, row: chartRow - 1 },
      ext: { width: embedW, height: embedH },
    });
    chartRow += Math.max(24, Math.ceil(embedH / 18));

    s4.getRow(chartRow).getCell(1).value = 'Payment methods (share of spending)';
    s4.getRow(chartRow).font = { bold: true, size: 12 };
    chartRow += 2;

    const pieBase64 = await renderChartToPngBase64(
      'pie',
      modeTotals.map((m) => m.label),
      modeTotals.map((m) => m.value),
      'By payment method'
    );
    const pieId = workbook.addImage({ base64: pieBase64, extension: 'png' });
    s4.addImage(pieId, {
      tl: { col: 0, row: chartRow - 1 },
      ext: { width: 480, height: 390 },
    });
  }

  // --- Sheet 6: Budget exceeded ---
  const s5 = workbook.addWorksheet('Budget exceeded');
  s5.columns = [
    { width: 25 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
  ];
  s5.getRow(1).getCell(1).value = `Budget Exceeded — ${periodLabel}`;
  s5.mergeCells(1, 1, 1, 4);
  s5.getRow(1).font = { bold: true, size: 14 };

  const h5 = s5.getRow(2);
  h5.values = ['Category', 'Monthly Limit', 'Spent Amount', 'Over Budget'];
  styleHeaderRow(h5);

  let r5 = 3;
  let exceededCount = 0;

  for (const cat of categories) {
    if (!cat.budgetAmount || cat.budgetAmount <= 0) continue;

    const monthlyLimit = getMonthlyBudgetLimit(cat);

    const catSpent = expenses
      .filter(e => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);

    if (catSpent > monthlyLimit) {
      exceededCount++;
      const row = s5.getRow(r5);
      row.getCell(1).value = cat.name;
      row.getCell(2).value = monthlyLimit;
      row.getCell(2).numFmt = INR_FMT;
      row.getCell(3).value = catSpent;
      row.getCell(3).numFmt = INR_FMT;
      row.getCell(4).value = catSpent - monthlyLimit;
      row.getCell(4).numFmt = INR_FMT;
      row.getCell(4).font = { color: { argb: 'FFFF0000' }, bold: true };
      r5++;
    }
  }

  if (exceededCount === 0) {
    s5.getRow(r5).getCell(1).value = 'No budgets exceeded in this period.';
    r5++;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expense-report-${fileSlug}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
