const crypto = require('crypto');

const headers = {
    'x-api-key': 'sdgdskldFPLGfjHn1421dgnlxdGTbngdflg6290bRjslfihsjhSDsdgGHH25hjf',
    'x-user-key': 'eyJjaSI6IjYwY2FiYjBiLTU1OTctNDQ4NS04ZjYzLTdlOWUwNTZlMGJiOCIsImVhbiI6IlVucmVnaXN0ZXJlZEFwcGxpY2F0aW9uIiwiZWsiOiJ1Y2JLdy05QjJtUmNFZ0tTNWRGN1FiTFhVUTh2MzdWbnZkcTBuM0I2dWVNaXhJaktKZFdmVi4zTXZYYkN5ZDU4WFpiSi5uejFYR0NJMUk2UFc1VkJXLXFieGNiQ09FRDdUS2Z1R3ljSkhHb18ifQ__',
    'x-request-id': crypto.randomUUID(), // or 'your-unique-uuid'
    'Content-Type': 'application/json'
  };

module.exports = { headers };