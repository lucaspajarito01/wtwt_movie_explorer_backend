import spec from '../src/docs/openapi.js';

const errors = [];
const fail = (m) => errors.push(m);
const json = JSON.parse(JSON.stringify(spec));               // ¿serializa limpio?

// ---- resolver $ref
const resolve = (node) => {
  if (node && node.$ref) {
    const path = node.$ref.replace(/^#\//, '').split('/');
    let cur = json;
    for (const p of path) cur = cur?.[p];
    if (cur === undefined) { fail(`$ref roto: ${node.$ref}`); return {}; }
    return resolve(cur);
  }
  return node;
};

// ---- mini validador de ejemplos contra esquemas (subconjunto de OpenAPI 3.0)
function check(schemaIn, value, path, out) {
  const schema = resolve(schemaIn);
  if (schema.allOf) { schema.allOf.forEach((s) => check(s, value, path, out)); return; }
  if (value === null) { if (!schema.nullable) out.push(`${path}: null no permitido`); return; }
  if (schema.enum && !schema.enum.includes(value)) out.push(`${path}: ${JSON.stringify(value)} fuera de enum`);
  switch (schema.type) {
    case 'object': {
      if (typeof value !== 'object' || Array.isArray(value)) { out.push(`${path}: se esperaba objeto`); return; }
      for (const r of schema.required ?? []) if (!(r in value)) out.push(`${path}: falta "${r}"`);
      for (const [k, v] of Object.entries(value)) {
        if (schema.properties?.[k]) check(schema.properties[k], v, `${path}.${k}`, out);
        else if (schema.properties) out.push(`${path}: propiedad no declarada "${k}"`);
      }
      if (schema.minProperties && Object.keys(value).length < schema.minProperties) out.push(`${path}: minProperties`);
      break;
    }
    case 'array':
      if (!Array.isArray(value)) { out.push(`${path}: se esperaba arreglo`); return; }
      value.forEach((v, i) => check(schema.items, v, `${path}[${i}]`, out));
      break;
    case 'string':
      if (typeof value !== 'string') { out.push(`${path}: se esperaba string`); return; }
      if (schema.maxLength && value.length > schema.maxLength) out.push(`${path}: supera maxLength`);
      if (schema.minLength && value.length < schema.minLength) out.push(`${path}: bajo minLength`);
      if (schema.format === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) out.push(`${path}: email inválido`);
      if (schema.format === 'uri' && !/^https?:\/\//.test(value)) out.push(`${path}: uri inválida`);
      if (schema.format === 'date-time' && Number.isNaN(Date.parse(value))) out.push(`${path}: date-time inválido`);
      break;
    case 'integer':
      if (!Number.isInteger(value)) { out.push(`${path}: se esperaba entero`); return; }
      if (schema.minimum !== undefined && value < schema.minimum) out.push(`${path}: bajo minimum`);
      if (schema.maximum !== undefined && value > schema.maximum) out.push(`${path}: sobre maximum`);
      break;
    case 'number':
      if (typeof value !== 'number') out.push(`${path}: se esperaba número`);
      break;
    case 'boolean':
      if (typeof value !== 'boolean') out.push(`${path}: se esperaba booleano`);
      break;
    default: break;
  }
}

// ---- esquemas: required existen en properties
for (const [name, s] of Object.entries(json.components.schemas)) {
  for (const r of s.required ?? []) if (!s.properties?.[r]) fail(`schema ${name}: required "${r}" no está en properties`);
}

// ---- operaciones
const ids = new Set();
let ops = 0, examples = 0;
const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
for (const [url, item] of Object.entries(json.paths)) {
  const pathParams = [...url.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
  for (const m of METHODS) {
    const op = item[m]; if (!op) continue;
    ops++;
    const where = `${m.toUpperCase()} ${url}`;
    if (!op.operationId) fail(`${where}: sin operationId`);
    else if (ids.has(op.operationId)) fail(`${where}: operationId repetido`); else ids.add(op.operationId);
    if (!op.tags?.length) fail(`${where}: sin tags`);
    else for (const t of op.tags) if (!json.tags.some((x) => x.name === t)) fail(`${where}: tag no declarado "${t}"`);
    if (!op.summary) fail(`${where}: sin summary`);
    if (!op.responses || !Object.keys(op.responses).length) fail(`${where}: sin responses`);
    const declared = (op.parameters ?? []).filter((p) => p.in === 'path').map((p) => p.name);
    for (const p of pathParams) if (!declared.includes(p)) fail(`${where}: falta parámetro de ruta {${p}}`);
    for (const p of declared) if (!pathParams.includes(p)) fail(`${where}: parámetro {${p}} no está en la URL`);
    for (const sec of op.security ?? []) for (const k of Object.keys(sec)) if (!json.components.securitySchemes[k]) fail(`${where}: security "${k}" no existe`);
    // cuerpo de petición
    const rb = op.requestBody?.content?.['application/json'];
    if (rb) for (const [n, ex] of Object.entries(rb.examples ?? {})) {
      const out = []; check(rb.schema, ex.value, `${where} body.${n}`, out); out.forEach(fail); examples++;
    }
    if (['post', 'put', 'patch'].includes(m) && !op.requestBody && !url.endsWith('/approve')) fail(`${where}: sin requestBody`);
    // respuestas
    for (const [code, r] of Object.entries(op.responses)) {
      const c = r.content?.['application/json'];
      if (!c) continue;
      if (c.example !== undefined) { const out = []; check(c.schema, c.example, `${where} ${code}`, out); out.forEach(fail); examples++; }
      else fail(`${where} ${code}: respuesta sin ejemplo`);
    }
    if (!op.responses[401] && op.security?.some((s) => s.bearerAuth) && !op.security.some((s) => Object.keys(s).length === 0 && false)) {
      if (!op.responses[401]) fail(`${where}: protegido pero sin respuesta 401`);
    }
  }
}
console.log(`operaciones: ${ops} · ejemplos verificados: ${examples} · esquemas: ${Object.keys(json.components.schemas).length}`);
console.log(`rutas: ${Object.keys(json.paths).length} · tamaño JSON: ${(JSON.stringify(json).length / 1024).toFixed(1)} KB`);
if (errors.length) { console.log('\nPROBLEMAS:'); errors.forEach((e) => console.log(' -', e)); process.exit(1); }
console.log('Especificación consistente ✔');
