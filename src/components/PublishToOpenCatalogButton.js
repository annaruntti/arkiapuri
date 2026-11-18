import React, { useState } from 'react'
import Button from './Button'
import { useLogin } from '../context/LoginProvider'
import {
    alertPublishError,
    alertPublishSuccess,
    publishFoodItemToOpenCatalog,
    publishMealToOpenCatalog,
} from '../utils/publishToOpenCatalog'

/**
 * Admin-only control to copy a personal FoodItem/Meal into the open catalog.
 */
const PublishToOpenCatalogButton = ({
    kind = 'food',
    itemId,
    style,
    type = 'SECONDARY',
    size,
    disabled = false,
    onPublished,
}) => {
    const { profile } = useLogin()
    const [busy, setBusy] = useState(false)

    if (profile?.platformRole !== 'admin') return null
    if (!itemId) return null

    const onPress = async () => {
        if (busy || disabled) return
        try {
            setBusy(true)
            if (kind === 'meal') {
                await publishMealToOpenCatalog(itemId)
            } else {
                await publishFoodItemToOpenCatalog(itemId)
            }
            alertPublishSuccess(kind)
            onPublished?.()
        } catch (error) {
            alertPublishError(error)
        } finally {
            setBusy(false)
        }
    }

    return (
        <Button
            title={busy ? 'Lisätään…' : 'Lisää avoimeen katalogiin'}
            type={type}
            size={size}
            style={style}
            onPress={onPress}
            disabled={busy || disabled}
        />
    )
}

export default PublishToOpenCatalogButton
