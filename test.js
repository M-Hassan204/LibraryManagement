const http = require('http');

const req = http.get('http://localhost:5132/api/book/search?title=Clean+Code', (res) => {
  let data = '';
  console.log('Status:', res.statusCode);
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
});

req.on('error', (e) => console.error(e));
