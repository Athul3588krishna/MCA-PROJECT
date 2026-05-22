function estimateFare(distance, peak) {
  const multiplier = peak ? 1.35 : 1
  return Math.round((35 + distance * 17) * multiplier)
}

module.exports = {
  estimateFare,
}
