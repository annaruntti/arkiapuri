import {
    addPantryItem,
    deletePantryItem,
    dismissPantryRemovalSuggestions,
} from '../services/collectionApi'
import {
    buildPantryScanAddPayload,
    normalizePantryScanCommitPayload,
    uniquePantryItemIds,
} from './pantryScanCommit'

/**
 * Commit pantry scan review: adds, removals, and dismissed suggestions.
 * @returns outcome for the screen to alert / refresh / rewrite candidates
 */
export const commitPantryScanItems = async ({
    payload,
    locationId,
}) => {
    const { selectedItems, removals, keptRemovals } =
        normalizePantryScanCommitPayload(payload)

    if (!selectedItems.length && !removals.length && !keptRemovals.length) {
        return { status: 'empty' }
    }

    const succeededKeys = []
    let lastError = null

    for (const item of selectedItems) {
        try {
            await addPantryItem(buildPantryScanAddPayload(item, locationId))
            if (item.key) succeededKeys.push(item.key)
        } catch (error) {
            lastError = error
            console.error('Error committing scan item:', error)
        }
    }

    if (removals.length) {
        for (const itemId of uniquePantryItemIds(removals)) {
            try {
                await deletePantryItem(itemId)
            } catch (error) {
                lastError = error
                console.error('Error removing scanned pantry item:', error)
            }
        }
    }

    if (keptRemovals.length) {
        await dismissPantryRemovalSuggestions(
            keptRemovals.map((item) => item.itemId),
            'missing_from_photo'
        )
    }

    const addsOk =
        selectedItems.length === 0 ||
        succeededKeys.length === selectedItems.length

    if (addsOk) {
        return {
            status: 'ok',
            succeededKeys,
            removalsCount: removals.length,
        }
    }

    return {
        status: 'partial',
        succeededKeys,
        selectedItems,
        lastError,
    }
}

/**
 * Rewrite remaining scan candidates after a partial commit.
 */
export const rewritePartialScanCandidates = (
    previousCandidates,
    selectedItems,
    succeededKeys
) => {
    const succeededSet = new Set(succeededKeys)
    const submittedByKey = new Map(
        selectedItems.map((item) => [item.key, item])
    )
    return previousCandidates.flatMap((candidate, index) => {
        const key = `${candidate.foodId || candidate.name}-${index}`
        if (succeededSet.has(key)) return []
        const submitted = submittedByKey.get(key)
        if (!submitted) return [candidate]
        return [
            {
                ...candidate,
                name: submitted.name,
                quantity: submitted.quantity,
                unit: submitted.unit,
                category: submitted.category,
                foodId: submitted.foodId,
                calories: submitted.calories,
                nutrition: submitted.nutrition,
                barcode: submitted.barcode,
                imageUrl: submitted.imageUrl,
            },
        ]
    })
}
