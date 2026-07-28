import { forwardRef } from 'react'

const DateTimePicker = forwardRef(
    ({ value, onChange, testID, minimumDate, style }, ref) => {
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
                ref={ref}
                data-testid={testID}
                type="date"
                value={toInputValue(value)}
                onChange={handleChange}
                min={minimumDate ? toInputValue(minimumDate) : undefined}
                style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: 16,
                    height: 40,
                    padding: '0 10px',
                    borderRadius: 4,
                    border: '1px solid #bbb',
                    backgroundColor: '#fff',
                    color: '#333',
                    ...style,
                }}
            />
        )
    }
)

DateTimePicker.displayName = 'DateTimePicker'

export default DateTimePicker
