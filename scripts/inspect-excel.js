import XLSX from "xlsx";

const filePath = process.argv[2];
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log("📊 Excel Structure:");
console.log("Columns:", Object.keys(data[0] || {}));
console.log("\n📝 First 3 rows:");
data.slice(0, 3).forEach((row, idx) => {
  console.log(`\nRow ${idx + 1}:`, JSON.stringify(row, null, 2));
});
