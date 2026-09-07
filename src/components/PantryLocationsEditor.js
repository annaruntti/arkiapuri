import { useEffect, useState } from 'react'
import {
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import CustomText from './CustomText'
import Button from './Button'
import ResponsiveModal from './ResponsiveModal'
import {
    LOCATION_TYPE_LABELS,
    PANTRY_LOCATION_TYPES,
    nextLocationName,
} from '../utils/pantryLocations'

const TypeChip = ({ type, selected, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.typeChip, selected && styles.typeChipSelected]}
    >
        <CustomText
            style={[styles.typeChipText, selected && styles.typeChipTextSelected]}
        >
            {LOCATION_TYPE_LABELS[type]}
        </CustomText>
    </TouchableOpacity>
)

const PantryLocationsEditor = ({
    visible,
    onClose,
    locations = [],
    onAdd,
    onRename,
    onDelete,
}) => {
    const [newType, setNewType] = useState('cupboard')
    const [newName, setNewName] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editingName, setEditingName] = useState('')

    useEffect(() => {
        if (!visible) {
            setNewType('cupboard')
            setNewName('')
            setEditingId(null)
            setEditingName('')
        }
    }, [visible])

    const handleAdd = async () => {
        const name = newName.trim() || nextLocationName(newType, locations)
        await onAdd?.({ type: newType, name })
        setNewName('')
        setNewType('cupboard')
    }

    const startRename = (location) => {
        setEditingId(String(location._id))
        setEditingName(location.name)
    }

    const saveRename = async (location) => {
        const name = editingName.trim()
        if (!name) return
        await onRename?.(location._id, { name })
        setEditingId(null)
        setEditingName('')
    }

    const confirmDelete = (location) => {
        Alert.alert(
            'Poista säilytyspaikka',
            `Poistetaanko "${location.name}"? Tuotteet jäävät pentteriin ilman sijaintia.`,
            [
                { text: 'Peruuta', style: 'cancel' },
                {
                    text: 'Poista',
                    style: 'destructive',
                    onPress: () => onDelete?.(location._id),
                },
            ]
        )
    }

    return (
        <ResponsiveModal
            visible={visible}
            onClose={onClose}
            title="Säilytyspaikat"
            maxWidth={520}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <CustomText style={styles.hint}>
                    Jaa pentteri jääkaappiin, pakastimeen ja kuivakaappeihin.
                    Voit lisätä useita saman tyyppisiä paikkoja.
                </CustomText>
                {locations.map((location) => {
                    const isEditing = editingId === String(location._id)
                    return (
                        <View key={String(location._id)} style={styles.row}>
                            <View style={styles.rowMain}>
                                {isEditing ? (
                                    <TextInput
                                        style={styles.input}
                                        value={editingName}
                                        onChangeText={setEditingName}
                                        autoFocus
                                    />
                                ) : (
                                    <>
                                        <CustomText style={styles.name}>
                                            {location.name}
                                        </CustomText>
                                        <CustomText style={styles.type}>
                                            {LOCATION_TYPE_LABELS[location.type] ||
                                                location.type}
                                        </CustomText>
                                    </>
                                )}
                            </View>
                            <View style={styles.rowActions}>
                                {isEditing ? (
                                    <TouchableOpacity
                                        onPress={() => saveRename(location)}
                                    >
                                        <CustomText style={styles.link}>
                                            Tallenna
                                        </CustomText>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => startRename(location)}
                                    >
                                        <CustomText style={styles.link}>
                                            Nimeä
                                        </CustomText>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => confirmDelete(location)}
                                >
                                    <CustomText style={styles.delete}>
                                        Poista
                                    </CustomText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                })}

                <CustomText style={styles.sectionLabel}>Lisää paikka</CustomText>
                <View style={styles.typeRow}>
                    {PANTRY_LOCATION_TYPES.map((type) => (
                        <TypeChip
                            key={type}
                            type={type}
                            selected={newType === type}
                            onPress={() => {
                                setNewType(type)
                                if (!newName.trim()) {
                                    setNewName(nextLocationName(type, locations))
                                }
                            }}
                        />
                    ))}
                </View>
                <TextInput
                    style={styles.input}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder={nextLocationName(newType, locations)}
                />
                <Button title="Lisää säilytyspaikka" onPress={handleAdd} />
            </ScrollView>
        </ResponsiveModal>
    )
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 16,
        gap: 10,
    },
    hint: {
        color: '#555',
        marginBottom: 4,
    },
    row: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 10,
        padding: 12,
        gap: 8,
    },
    rowMain: {
        gap: 2,
    },
    rowActions: {
        flexDirection: 'row',
        gap: 16,
    },
    name: {
        fontWeight: '700',
        fontSize: 15,
    },
    type: {
        color: '#666',
        fontSize: 13,
    },
    link: {
        color: '#5844BB',
        fontWeight: '600',
    },
    delete: {
        color: '#b91c1c',
        fontWeight: '600',
    },
    sectionLabel: {
        fontWeight: '700',
        marginTop: 8,
    },
    typeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeChip: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 16,
        backgroundColor: '#eee',
    },
    typeChipSelected: {
        backgroundColor: '#AE9CFC',
    },
    typeChipText: {
        fontWeight: '600',
        fontSize: 13,
    },
    typeChipTextSelected: {
        color: '#000',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
})

export default PantryLocationsEditor
