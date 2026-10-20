import { useState } from 'react'
import {
    Animated,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import { formStyles } from '../styles/formStyles'
import CustomText from './CustomText'
import ToggleButton from './ToggleButton'

/**
 * Expandable shopping-list picker used inside FormFoodItem location rows.
 */
const FormFoodItemShoppingListSelector = ({
    shoppingLists,
    selectedId,
    onSelect,
}) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [animation] = useState(new Animated.Value(0))

    if (!shoppingLists || shoppingLists.length === 0) return null

    const animateIn = () => {
        Animated.timing(animation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start()
    }

    const animateOut = (callback) => {
        Animated.timing(animation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start(callback)
    }

    const toggleExpansion = () => {
        if (isExpanded) {
            animateOut(() => {
                setIsExpanded(false)
            })
        } else {
            setIsExpanded(true)
            animateIn()
        }
    }

    const selectedList = shoppingLists.find((list) => list._id === selectedId)
    const displayText = selectedList
        ? selectedList.name
        : 'Valitse ostoslista...'

    return (
        <View style={styles.shoppingListContainer}>
            <CustomText style={formStyles.label}>Valitse ostoslista</CustomText>
            <ToggleButton
                label={displayText}
                expanded={isExpanded}
                onPress={toggleExpansion}
                muted={!selectedList}
            />

            {isExpanded ? (
                <Animated.View
                    style={[
                        styles.shoppingListExpandableSection,
                        {
                            maxHeight: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 300],
                            }),
                            opacity: animation,
                        },
                    ]}
                >
                    <View style={styles.shoppingListHeader}>
                        <CustomText style={styles.shoppingListTitle}>
                            Valitse ostoslista
                        </CustomText>
                        <TouchableOpacity
                            onPress={toggleExpansion}
                            style={styles.shoppingListCloseButton}
                        >
                            <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.shoppingListScrollContainer}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                    >
                        <TouchableOpacity
                            style={[
                                styles.shoppingListOption,
                                !selectedId && styles.shoppingListOptionSelected,
                            ]}
                            onPress={() => {
                                onSelect('')
                                toggleExpansion()
                            }}
                        >
                            <CustomText
                                style={[
                                    styles.shoppingListOptionText,
                                    !selectedId &&
                                        styles.shoppingListOptionTextSelected,
                                ]}
                            >
                                Ei ostoslistaa
                            </CustomText>
                        </TouchableOpacity>
                        {shoppingLists.map((list) => {
                            const isSelected = selectedId === list._id
                            return (
                                <TouchableOpacity
                                    key={list._id}
                                    style={[
                                        styles.shoppingListOption,
                                        isSelected &&
                                            styles.shoppingListOptionSelected,
                                    ]}
                                    onPress={() => {
                                        onSelect(list._id)
                                        toggleExpansion()
                                    }}
                                >
                                    <CustomText
                                        style={[
                                            styles.shoppingListOptionText,
                                            isSelected &&
                                                styles.shoppingListOptionTextSelected,
                                        ]}
                                    >
                                        {list.name}
                                    </CustomText>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </Animated.View>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    shoppingListContainer: {
        marginBottom: 10,
    },
    shoppingListExpandableSection: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginTop: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    shoppingListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        backgroundColor: '#fff',
    },
    shoppingListTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    shoppingListCloseButton: {
        padding: 5,
    },
    shoppingListScrollContainer: {
        maxHeight: 200,
        padding: 15,
    },
    shoppingListOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 6,
        marginBottom: 4,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    shoppingListOptionSelected: {
        backgroundColor: '#f8f5ff',
        borderColor: '#5844BB',
    },
    shoppingListOptionText: {
        fontSize: 16,
        color: '#666',
        flex: 1,
    },
    shoppingListOptionTextSelected: {
        color: '#333',
        fontWeight: '500',
    },
})

export default FormFoodItemShoppingListSelector
