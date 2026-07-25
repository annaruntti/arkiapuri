/**
 * Map Open Food Facts category tags to Arkiapuri category names
 * (same names as in data/categories.json).
 */

const CATEGORY_RULES = [
    {
        name: 'Maitotuotteet',
        patterns: [
            /^milks?$/,
            /^dair(y|ies)$/,
            /cheeses?/,
            /yogurt/,
            /yoghurt/,
            /^cream$/,
            /butter/,
            /maito/,
            /juusto/,
            /dairy-drinks/,
            /milk-drinks/,
        ],
    },
    {
        name: 'Kala',
        patterns: [/fishes?/, /seafood/, /salmon/, /tuna/, /kala/],
    },
    {
        name: 'Liha',
        patterns: [/meats?/, /poultry/, /chicken/, /beef/, /pork/, /liha/],
    },
    {
        name: 'Kasvikset',
        patterns: [
            /vegetables?/,
            /fruits?/,
            /fruits-and-vegetables/,
            /kasvis/,
            /hedelm/,
            /peach/,
            /persikka/,
        ],
    },
    {
        name: 'Kasviproteiinit',
        patterns: [
            /legumes?/,
            /pulses?/,
            /tofu/,
            /tempeh/,
            /plant-based-meat/,
            /soya/,
            /soy/,
        ],
    },
    {
        name: 'Kuiva-aineet',
        patterns: [
            /cereals?/,
            /pasta/,
            /rice/,
            /breads?/,
            /flours?/,
            /grains?/,
            /kuiva/,
        ],
    },
    {
        name: 'Juomat',
        patterns: [
            // Avoid matching the broad tag "plant-based-foods-and-beverages"
            /^beverages?$/,
            /^drinks?$/,
            /^waters?$/,
            /juices?/,
            /^sodas?$/,
            /soft-drinks/,
            /plant-based-beverages/,
            /juoma/,
        ],
    },
    {
        name: 'Mausteet',
        patterns: [/spices?/, /seasonings?/, /sauces?/, /condiments?/, /mauste/],
    },
    {
        name: 'Pakasteet',
        patterns: [/\bfrozen\b/, /pakaste/],
    },
    {
        name: 'Säilykkeet',
        patterns: [
            /canned/,
            /preserves?/,
            /fruit-and-vegetable-preserves/,
            /canned-fruits?/,
            /canned-vegetables?/,
            /säilyke/,
        ],
    },
    {
        name: 'Valmisateriat',
        patterns: [/prepared-meals?/, /ready-meals?/, /valmis/],
    },
    {
        name: 'Leivontatarvikkeet',
        patterns: [/baking/, /leivonta/],
    },
]

const BROAD_OFF_TAGS = new Set([
    'plant-based-foods-and-beverages',
    'plant-based-foods',
    'foods',
    'groceries',
    'snacks',
    'breakfasts',
    'spreads',
    'plant-based-spreads',
    'sweet-spreads',
])

const CATEGORY_PRIORITY = [
    'Pakasteet',
    'Säilykkeet',
    'Maitotuotteet',
    'Kala',
    'Liha',
    'Kasviproteiinit',
    'Kasvikset',
    'Kuiva-aineet',
    'Juomat',
    'Mausteet',
    'Valmisateriat',
    'Leivontatarvikkeet',
]

const normalizeTag = (tag) =>
    String(tag)
        .replace(/^[a-z]{2}:/, '')
        .replace(/_/g, '-')
        .toLowerCase()
        .trim()

export const mapOpenFoodFactsCategories = (
    categories = [],
    mainCategory
) => {
    const tags = [...categories, mainCategory || '']
        .filter(Boolean)
        .map((tag) => normalizeTag(tag))
        .filter((tag) => tag && !BROAD_OFF_TAGS.has(tag))

    const matched = new Set()

    for (const tag of tags) {
        for (const rule of CATEGORY_RULES) {
            if (rule.patterns.some((pattern) => pattern.test(tag))) {
                matched.add(rule.name)
            }
        }
    }

    return CATEGORY_PRIORITY.filter((name) => matched.has(name))
}

export const mapOpenFoodFactsImage = (imageUrl, imageFrontUrl) => {
    const url = imageUrl || imageFrontUrl
    if (!url) return undefined
    return { url }
}

const UNIT_ALIASES = {
    g: 'g',
    gr: 'g',
    gram: 'g',
    grams: 'g',
    kg: 'kg',
    kilogram: 'kg',
    kilograms: 'kg',
    ml: 'ml',
    milliliter: 'ml',
    millilitre: 'ml',
    milliliters: 'ml',
    millilitres: 'ml',
    l: 'l',
    lt: 'l',
    liter: 'l',
    litre: 'l',
    liters: 'l',
    litres: 'l',
    dl: 'dl',
    cl: { unit: 'ml', factor: 10 },
    oz: { unit: 'g', factor: 28.3495 },
    'fl oz': { unit: 'ml', factor: 29.5735 },
    floz: { unit: 'ml', factor: 29.5735 },
    pcs: 'kpl',
    pc: 'kpl',
    piece: 'kpl',
    pieces: 'kpl',
    unit: 'kpl',
    units: 'kpl',
    kpl: 'kpl',
    tsp: 'tl',
    tbsp: 'rkl',
    tl: 'tl',
    rkl: 'rkl',
}

const normalizeUnitToken = (raw) =>
    String(raw)
        .toLowerCase()
        .replace(/[.]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

const resolveUnit = (rawUnit, amount) => {
    const token = normalizeUnitToken(rawUnit)
    const mapping =
        UNIT_ALIASES[token] || UNIT_ALIASES[token.replace(/\s/g, '')]

    if (!mapping) {
        return { unit: 'kpl', quantity: amount || 1 }
    }

    if (typeof mapping === 'string') {
        return { unit: mapping, quantity: amount }
    }

    return {
        unit: mapping.unit,
        quantity: Number((amount * mapping.factor).toFixed(3)),
    }
}

/**
 * Parse OFF quantity fields into app unit + package size.
 * Supports product_quantity fields, "500 g", "1.5 L", and "6 x 25 cl".
 */
export const parseOpenFoodFactsQuantity = ({
    quantityLabel,
    productQuantity,
    productQuantityUnit,
} = {}) => {
    const label =
        typeof quantityLabel === 'string' ? quantityLabel.trim() : undefined

    if (productQuantity != null && productQuantityUnit) {
        const amount = parseFloat(String(productQuantity).replace(',', '.'))
        if (Number.isFinite(amount) && amount > 0) {
            const resolved = resolveUnit(String(productQuantityUnit), amount)
            return {
                unit: resolved.unit,
                packageQuantity: resolved.quantity,
                quantityLabel: label || undefined,
            }
        }
    }

    if (label) {
        const multipack = label.match(
            /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*([a-zA-Zµ]+)/i
        )
        if (multipack) {
            const count = parseFloat(multipack[1].replace(',', '.'))
            const size = parseFloat(multipack[2].replace(',', '.'))
            const resolved = resolveUnit(multipack[3], count * size)
            return {
                unit: resolved.unit,
                packageQuantity: resolved.quantity,
                quantityLabel: label,
            }
        }

        const simple = label.match(/(\d+(?:[.,]\d+)?)\s*([a-zA-Zµ]+)/i)
        if (simple) {
            const amount = parseFloat(simple[1].replace(',', '.'))
            const resolved = resolveUnit(simple[2], amount)
            return {
                unit: resolved.unit,
                packageQuantity: resolved.quantity,
                quantityLabel: label,
            }
        }
    }

    return {
        unit: 'kpl',
        packageQuantity: 1,
        quantityLabel: label || undefined,
    }
}

/**
 * Normalize OFF product into fields compatible with our FoodItem shape in the UI.
 */
export const mapOpenFoodFactsToFoodItemFields = (product) => {
    const category = mapOpenFoodFactsCategories(
        product.categories || [],
        product.mainCategory
    )
    const image = mapOpenFoodFactsImage(
        product.imageUrl,
        product.imageFrontUrl
    )
    const parsedQuantity = parseOpenFoodFactsQuantity({
        quantityLabel: product.quantity || product.quantityLabel,
        productQuantity:
            product.productQuantity ?? product.product_quantity ?? null,
        productQuantityUnit:
            product.productQuantityUnit ||
            product.product_quantity_unit ||
            null,
    })

    return {
        name: product.name || product.product_name || 'Tuntematon tuote',
        category,
        calories:
            product.nutrition?.calories ||
            product.nutriments?.['energy-kcal_100g'] ||
            0,
        image,
        unit: parsedQuantity.unit,
        packageQuantity: parsedQuantity.packageQuantity,
        price: 0,
        source: 'openfoodfacts',
        openFoodFactsData: {
            barcode: product.barcode || product.code,
            brands: product.brands,
            nutritionGrade: product.nutritionGrade || product.nutrition_grades,
            novaGroup: product.novaGroup || product.nova_group,
            imageUrl: image?.url,
            quantityLabel: parsedQuantity.quantityLabel,
            nutrition: product.nutrition,
            labels: product.labels || product.labels_tags,
            allergens: product.allergens || product.allergens_tags,
        },
    }
}

/** Resolve display image for food/pantry list items. */
export const getFoodItemImageUrl = (item) =>
    item?.image?.url ||
    item?.openFoodFactsData?.imageUrl ||
    item?.imageUrl ||
    null
