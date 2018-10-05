const crypto= require('crypto');

function encryption(payload) {
    const hash = crypto.createHash('sha256');
    hash.update(payload, 'utf8');
    return hash.digest('hex');
}