import RNDateTimePicker from '@react-native-community/datetimepicker'
import React from 'react'

const DateTimePicker = ({
    value,
    mode = 'date',
    display = 'default',
    onChange,
    minimumDate,
    testID,
}) => {
    return (
        <RNDateTimePicker
            value={value}
            mode={mode}
            display={display}
            onChange={onChange}
            minimumDate={minimumDate}
            testID={testID}
        />
    )
}

export default DateTimePicker
