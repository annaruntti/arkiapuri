const positive = (value) => {
    const parsed = parseFloat(String(value ?? '').replace(',', '.'))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

export const lineAmount = (item) => {
    const price = positive(item?.price)
    if (price > 0) {
        return {
            amount: price,
            estimated: false,
            openPrices: false,
            missing: false,
        }
    }
    const estimate = positive(item?.priceEstimate) || positive(item?.estimatedPrice)
    if (estimate > 0) {
        const openPrices =
            item?.priceEstimateSource === 'history' &&
            (item?.priceFromOpenPrices ||
                item?.foodId?.priceSource === 'open-prices')
        return {
            amount: estimate,
            estimated: true,
            openPrices,
            missing: false,
        }
    }
    return { amount: 0, estimated: false, openPrices: false, missing: true }
}

export const formatEuro = (amount) => `${Number(amount).toFixed(2)} €`

export const formatLinePrice = (item) => {
    const line = lineAmount(item)
    if (line.missing) return ''
    const label = formatEuro(line.amount)
    if (!line.estimated) return label
    return line.openPrices ? `${label} arvio · Open Prices` : `${label} arvio`
}

export const sumLineAmounts = (items) =>
    (items || []).reduce((sum, item) => sum + lineAmount(item).amount, 0)
