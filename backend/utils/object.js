function pick(source, allowed) {
  return allowed.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) result[key] = source[key]
    return result
  }, {})
}

module.exports = {
  pick,
}
