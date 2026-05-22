function send(res, status, payload) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Content-Type': 'application/json',
  })
  res.end(payload ? JSON.stringify(payload, null, 2) : '')
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 1e6) {
        req.destroy()
        reject(Object.assign(new Error('Request body too large'), { status: 413 }))
      }
    })
    req.on('end', () => {
      if (!body) return resolve({})
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(Object.assign(new Error('Invalid JSON body'), { status: 400 }))
      }
    })
  })
}

module.exports = {
  readBody,
  send,
}
