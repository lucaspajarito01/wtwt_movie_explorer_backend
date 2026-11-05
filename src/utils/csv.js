function escapeCell(value) {
    if (value === null || value === undefined) return "";
    const text = value instanceof Date ? value.toISOString() : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(filas, columnas) {
    const header = columnas.map((c) => escapeCell(c.header)).join(",");
    const lines = filas.map((fila) =>
        columnas.map((c) => escapeCell(c.value(fila))).join(","),
    );
    return [header, ...lines].join("\r\n") + "\r\n";
}
