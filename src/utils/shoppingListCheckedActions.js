/**
 * Resolve checked ids against the current list items (avoids stale food ids).
 */
export const resolveCheckedShoppingItems = (
    items,
    checkedItemIds,
    getId
) => {
    const selectedIds = new Set(
        (checkedItemIds || []).map((id) => String(id).trim()).filter(Boolean)
    )
    const selectedItems = (items || []).filter((item) =>
        selectedIds.has(getId(item))
    )
    const itemIds = [
        ...new Set(selectedItems.map((item) => getId(item)).filter(Boolean)),
    ]
    return { selectedItems, itemIds }
}

export const nameByShoppingItemId = (selectedItems, getId) =>
    Object.fromEntries(
        selectedItems.map((item) => [getId(item), item.name])
    )

/**
 * Build success / notice alerts after moving checked items to pantry.
 */
export const buildMoveToPantryAlert = ({
    moved,
    removedNonFood,
    skippedNonFood,
    notFound,
    nameById,
}) => {
    if (moved.length > 0 || removedNonFood.length > 0) {
        const movedNames = moved
            .map((item) => item.name || nameById[String(item.id)] || '')
            .filter(Boolean)
        const removedNames = removedNonFood
            .map((item) => item.name || nameById[String(item.id)] || '')
            .filter(Boolean)
        const parts = []
        if (moved.length > 0) {
            parts.push(
                `${moved.length} elintarviketta pentteriin${
                    movedNames.length ? `: ${movedNames.join(', ')}` : ''
                }`
            )
        }
        if (removedNonFood.length > 0) {
            parts.push(
                `${removedNonFood.length} muuta tuotetta poistettu listalta${
                    removedNames.length ? `: ${removedNames.join(', ')}` : ''
                }`
            )
        }
        if (notFound.length > 0) {
            parts.push(`${notFound.length} valintaa ei löytynyt listalta`)
        }
        return { title: 'Onnistui', message: parts.join('. ') + '.' }
    }

    if (skippedNonFood.length > 0) {
        return {
            title: 'Huomio',
            message:
                'Muut tuotteet eivät siirry pentteriin. Poista ne listalta tai merkitse ostetuiksi.',
        }
    }

    return {
        title: 'Huomio',
        message:
            notFound.length > 0
                ? 'Valittuja tuotteita ei löytynyt listalta. Kokeile valita uudelleen.'
                : 'Valittuja tuotteita ei voitu siirtää',
    }
}

/**
 * Normalize move-to-pantry API payload arrays.
 */
export const parseMoveToPantryResponse = (data) => {
    const moved = Array.isArray(data?.moved) ? data.moved : []
    const skippedNonFood = Array.isArray(data?.skippedNonFood)
        ? data.skippedNonFood
        : []
    const removedNonFood = Array.isArray(data?.removedNonFood)
        ? data.removedNonFood
        : skippedNonFood
    const notFound = Array.isArray(data?.notFound) ? data.notFound : []
    return { moved, skippedNonFood, removedNonFood, notFound }
}
