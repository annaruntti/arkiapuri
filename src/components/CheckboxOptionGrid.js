import { Pressable, StyleSheet, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'

const LONG_WORD_CHARS = 13

const longestWordLength = (label) =>
    Math.max(
        0,
        ...String(label || '')
            .split(/[\s,/]+/)
            .map((word) => word.length)
    )

const isLongLabel = (label) => longestWordLength(label) > LONG_WORD_CHARS

const sortShortThenLong = (items) => {
    const shortItems = []
    const longItems = []
    items.forEach((item) => {
        if (isLongLabel(item.label)) longItems.push(item)
        else shortItems.push(item)
    })
    return [...shortItems, ...longItems]
}

const CheckboxOptionGrid = ({ options = [], groups = [], value = [], onSelect }) => {
    const selected = Array.isArray(value) ? value.map(String) : []

    const toggle = (optionValue) => {
        const key = String(optionValue)
        const next = selected.includes(key)
            ? selected.filter((item) => item !== key)
            : [...selected, key]
        onSelect?.(next)
    }

    const renderGrid = (items) => (
        <View style={styles.grid}>
            {sortShortThenLong(items).map((option) => {
                const isSelected = selected.includes(String(option.value))
                const wide = isLongLabel(option.label)
                return (
                    <Pressable
                        key={option.value}
                        style={[styles.gridItem, wide && styles.gridItemWide]}
                        onPress={() => toggle(option.value)}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                isSelected && styles.checkboxChecked,
                            ]}
                        >
                            {isSelected ? (
                                <MaterialIcons
                                    name="check"
                                    size={16}
                                    color="white"
                                />
                            ) : null}
                        </View>
                        <CustomText style={styles.label}>
                            {option.label}
                        </CustomText>
                    </Pressable>
                )
            })}
        </View>
    )

    if (groups.length > 0) {
        return (
            <View style={styles.container}>
                {groups.map((group) => (
                    <View key={group.title} style={styles.group}>
                        <CustomText style={styles.groupTitle}>
                            {group.title}
                        </CustomText>
                        {renderGrid(group.options || [])}
                    </View>
                ))}
            </View>
        )
    }

    return <View style={styles.container}>{renderGrid(options)}</View>
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 5,
        marginBottom: 10,
    },
    group: {
        marginBottom: 8,
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        paddingVertical: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
        width: '48%',
    },
    gridItemWide: {
        width: '100%',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#5844BB',
        marginRight: 10,
        marginTop: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    checkboxChecked: {
        backgroundColor: '#AE9CFC',
    },
    label: {
        fontSize: 16,
        color: '#000000',
        flex: 1,
        flexShrink: 1,
    },
})

export default CheckboxOptionGrid
