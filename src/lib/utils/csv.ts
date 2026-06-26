export interface CsvRow {
  line: number;
  values: string[];
}

export interface ParsedCsv {
  headers: string[];
  rows: CsvRow[];
}

function detectDelimiter(input: string) {
  let commas = 0;
  let semicolons = 0;
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (character === '"') {
      if (inQuotes && input[index + 1] === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (character === "\n" || character === "\r")) {
      break;
    }

    if (!inQuotes && character === ",") {
      commas += 1;
    }

    if (!inQuotes && character === ";") {
      semicolons += 1;
    }
  }

  return semicolons > commas ? ";" : ",";
}

function parseRows(input: string, delimiter: string) {
  const rows: CsvRow[] = [];
  let values: string[] = [];
  let value = "";
  let inQuotes = false;
  let line = 1;
  let rowLine = 1;

  function commitRow() {
    values.push(value);

    if (values.some((cell) => cell.trim())) {
      rows.push({ line: rowLine, values });
    }

    values = [];
    value = "";
  }

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (character === '"') {
      if (inQuotes && input[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && character === delimiter) {
      values.push(value);
      value = "";
      continue;
    }

    if (character === "\n" || character === "\r") {
      if (character === "\r" && input[index + 1] === "\n") {
        index += 1;
      }

      if (inQuotes) {
        value += "\n";
      } else {
        commitRow();
        rowLine = line + 1;
      }

      line += 1;
      continue;
    }

    value += character;
  }

  if (inQuotes) {
    throw new Error(`Guillemet non fermé à partir de la ligne ${rowLine}.`);
  }

  if (value || values.length > 0) {
    commitRow();
  }

  return rows;
}

export function parseCsv(input: string): ParsedCsv {
  const rows = parseRows(input, detectDelimiter(input));

  if (rows.length === 0) {
    throw new Error("Le fichier CSV est vide.");
  }

  const [headerRow, ...dataRows] = rows;

  return {
    headers: headerRow.values.map((value) => value.replace(/^\uFEFF/, "").trim()),
    rows: dataRows,
  };
}
