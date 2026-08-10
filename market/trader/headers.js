const crypto = require('crypto');

const headers = {
    'x-api-key': 'sdgdskldFPLGfjHn1421dgnlxdGTbngdflg6290bRjslfihsjhSDsdgGHH25hjf',
    'x-user-key':'eyJjaSI6IjYwY2FiYjBiLTU1OTctNDQ4NS04ZjYzLTdlOWUwNTZlMGJiOCIsImVhbiI6IlVucmVnaXN0ZXJlZEFwcGxpY2F0aW9uIiwiZWsiOiJ1Q0J6WFQ2VGhDQURFT2ppVDIyMi1iUWRhV1BhQU83ejF0b1B2NEhHRGVyVW5XQTU5WDVpZURIRVowc0lNZjFlLlRSRUVmQlVIak05amM4WXVxZ0c0bC1QUEpLb25xWWlMZDFOdkxXMlBoVV8ifQ__',
    'x-request-id': crypto.randomUUID(), // or 'your-unique-uuid'
    'Content-Type': 'application/json'
  };

module.exports = { headers };