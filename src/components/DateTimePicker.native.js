import React from 'react'
import { Button } from 'react-native'

const DateTimePicker = () => {
    const handlePress = () => {
        // Handle press logic here
    }

    return (
        <Button
            title={buttonTitle}
            onPress={handlePress}
            style={styles.tertiaryButton}
        />
    )
}

export default DateTimePicker
