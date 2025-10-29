import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'
import Button from './Button'
import CustomText from './CustomText'

const SearchSection = ({
    searchQuery,
    onSearchChange,
    onClearSearch,
    placeholder = 'Etsi...',
    showResultsInfo = true,
    resultsCount = 0,
    resultsText = 'Löytyi {count} tuotetta',
    noResultsText = 'Tuotteita ei löytynyt',
    // Button section props
    showButtonSection = false,
    buttonTitle,
    onButtonPress,
    buttonStyle,
    buttonTextStyle,
    // Filter component
    filterComponent,
}) => {
    return (
        <View style={styles.searchSection}>
            <View style={styles.searchInputContainer}>
                <MaterialIcons
                    name="search"
                    size={20}
                    color="#666"
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder={placeholder}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={onClearSearch}
                        style={styles.clearButton}
                    >
                        <MaterialIcons name="clear" size={20} color="#666" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Search results info */}
            {showResultsInfo && searchQuery.length > 0 && (
                <View style={styles.searchResultsInfo}>
                    <CustomText style={styles.searchResultsText}>
                        {resultsCount > 0
                            ? resultsText.replace('{count}', resultsCount)
                            : noResultsText}
                    </CustomText>
                </View>
            )}

            {/* Button section */}
            {showButtonSection && (
                <View style={styles.buttonSection}>
                    <View style={styles.buttonContainer}>
                        {buttonTitle && onButtonPress && (
                            <Button
                                title={buttonTitle}
                                onPress={onButtonPress}
                                style={buttonStyle}
                                textStyle={buttonTextStyle}
                            />
                        )}
                        {filterComponent}
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = {
    searchSection: {
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: 'rgb(248, 248, 248)',
        paddingVertical: 15,
        borderRadius: 10,
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
        width: '100%',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    searchResultsInfo: {
        marginTop: 10,
    },
    searchResultsText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    buttonSection: {
        marginTop: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        justifyContent: 'space-between',
    },
}

export default SearchSection
