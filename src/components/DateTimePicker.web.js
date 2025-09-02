import React from 'react'

const DateTimePicker = ({ value, onChange, testID, minimumDate }) => {
    const toInputValue = (date) => {
        try {
            const d = new Date(date)
            const yyyy = d.getFullYear()
            const mm = String(d.getMonth() + 1).padStart(2, '0')
            const dd = String(d.getDate()).padStart(2, '0')
            return `${yyyy}-${mm}-${dd}`
        } catch {
            return ''
        }
    }

    const handleChange = (e) => {
        const selected = e.target.value ? new Date(e.target.value) : null
        onChange && onChange(null, selected)
    }

    return (
        <input
            data-testid={testID}
            type="date"
            value={toInputValue(value)}
            onChange={handleChange}
            min={minimumDate ? toInputValue(minimumDate) : undefined}
            style={{
                fontSize: 16,
                padding: 8,
                borderRadius: 6,
                border: '1px solid #ddd',
                backgroundColor: '#fff',
            }}
        />
    )
}

export default DateTimePicker
