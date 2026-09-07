import { StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'
import ResponsiveModal from './ResponsiveModal'
import { LOCATION_TYPE_LABELS } from '../utils/pantryLocations'

const PantryScanLocationPicker = ({
    visible,
    onClose,
    locations = [],
    onSelect,
}) => (
    <ResponsiveModal
        visible={visible}
        onClose={onClose}
        title="Minkä paikan kuvaat?"
        maxWidth={480}
    >
        <CustomText style={styles.hint}>
            Skannaus ehdottaa lisäyksiä ja poistoja vain valitulle paikalle.
        </CustomText>
        <View style={styles.list}>
            {locations.map((location) => (
                <TouchableOpacity
                    key={String(location._id)}
                    style={styles.row}
                    onPress={() => onSelect?.(location)}
                >
                    <CustomText style={styles.name}>{location.name}</CustomText>
                    <CustomText style={styles.type}>
                        {LOCATION_TYPE_LABELS[location.type] || location.type}
                    </CustomText>
                </TouchableOpacity>
            ))}
        </View>
    </ResponsiveModal>
)

const styles = StyleSheet.create({
    hint: {
        color: '#555',
        marginBottom: 12,
    },
    list: {
        gap: 8,
        paddingBottom: 8,
    },
    row: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 14,
    },
    name: {
        fontWeight: '700',
        fontSize: 16,
    },
    type: {
        color: '#666',
        marginTop: 2,
        fontSize: 13,
    },
})

export default PantryScanLocationPicker
