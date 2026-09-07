import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'
import {
    ALL_LOCATIONS_ID,
    UNLOCATED_LOCATION_ID,
} from '../utils/pantryLocations'

const Chip = ({ label, selected, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.chip, selected && styles.chipSelected]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
    >
        <CustomText style={[styles.chipText, selected && styles.chipTextSelected]}>
            {label}
        </CustomText>
    </TouchableOpacity>
)

const PantryLocationChips = ({
    locations = [],
    selectedLocationId = ALL_LOCATIONS_ID,
    onSelect,
    onManage,
    unlocatedCount = 0,
}) => (
    <View style={styles.wrap}>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
        >
            <Chip
                label="Kaikki"
                selected={selectedLocationId === ALL_LOCATIONS_ID}
                onPress={() => onSelect?.(ALL_LOCATIONS_ID)}
            />
            {locations.map((location) => (
                <Chip
                    key={String(location._id)}
                    label={location.name}
                    selected={selectedLocationId === String(location._id)}
                    onPress={() => onSelect?.(String(location._id))}
                />
            ))}
            {unlocatedCount > 0 ? (
                <Chip
                    label="Ei sijaintia"
                    selected={selectedLocationId === UNLOCATED_LOCATION_ID}
                    onPress={() => onSelect?.(UNLOCATED_LOCATION_ID)}
                />
            ) : null}
            <TouchableOpacity
                onPress={onManage}
                style={styles.manageChip}
                accessibilityRole="button"
                accessibilityLabel="Hallitse säilytyspaikkoja"
            >
                <CustomText style={styles.manageText}>Hallitse paikkoja</CustomText>
            </TouchableOpacity>
        </ScrollView>
    </View>
)

const styles = StyleSheet.create({
    wrap: {
        marginBottom: 10,
    },
    row: {
        gap: 8,
        paddingRight: 8,
        alignItems: 'center',
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 16,
        backgroundColor: '#eee',
    },
    chipSelected: {
        backgroundColor: '#AE9CFC',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    chipTextSelected: {
        color: '#000',
    },
    manageChip: {
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    manageText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#5844BB',
    },
})

export default PantryLocationChips
