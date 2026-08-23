import { useState } from 'react'
import { Platform, TextInput, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Button from './Button'
import CustomText from './CustomText'
import GenericFilterSection from './GenericFilterSection'
import PrimaryActionFade from './PrimaryActionFade'
import { useResponsiveDimensions } from '../utils/responsive'

const SearchSection = ({
    searchQuery,
    onSearchChange,
    onClearSearch,
    placeholder = 'Etsi...',
    showResultsInfo = true,
    resultsCount = 0,
    resultsText = 'Löytyi {count} tuotetta',
    noResultsText = 'Tuotteita ei löytynyt',
    showButtonSection = false,
    buttonTitle,
    onButtonPress,
    buttonStyle,
    buttonTextStyle,
    extraButtonTitle,
    extraButtonType = 'TERTIARY',
    onExtraButtonPress,
    extraButtonStyle,
    extraButtonTextStyle,
    buttonType = 'PRIMARY',
    actionsLabel,
    filterComponent,
    filterPlacement = 'withActions',
    showFilters,
    filterSectionProps,
}) => {
    const { isDesktop } = useResponsiveDimensions()
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const filterWithSearch = filterPlacement === 'withSearch' && filterComponent
    const fillButtonsOnMobile = filterWithSearch && !isDesktop

    return (
        <View style={styles.searchSection}>
            <View style={styles.searchRow}>
                <View
                    style={[
                        styles.searchInputContainer,
                        filterWithSearch && styles.searchInputWithFilter,
                        isSearchFocused && styles.searchInputContainerFocused,
                    ]}
                >
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
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
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
                {filterWithSearch}
            </View>

            {showResultsInfo && searchQuery.length > 0 && (
                <View style={styles.searchResultsInfo}>
                    <CustomText style={styles.searchResultsText}>
                        {resultsCount > 0
                            ? resultsText.replace('{count}', resultsCount)
                            : noResultsText}
                    </CustomText>
                </View>
            )}

            {showButtonSection && (
                <PrimaryActionFade
                    style={[
                        styles.buttonSection,
                        filterWithSearch && styles.buttonSectionSeparated,
                    ]}
                >
                    {actionsLabel ? (
                        <CustomText style={styles.actionsLabel}>
                            {actionsLabel}
                        </CustomText>
                    ) : null}
                    <View
                        style={[
                            styles.buttonContainer,
                            filterWithSearch && styles.buttonContainerStart,
                            fillButtonsOnMobile && styles.buttonContainerFill,
                        ]}
                    >
                        {buttonTitle && onButtonPress && (
                            <Button
                                title={buttonTitle}
                                type={buttonType}
                                onPress={onButtonPress}
                                style={[
                                    buttonStyle,
                                    fillButtonsOnMobile && styles.fillButton,
                                ]}
                                textStyle={buttonTextStyle}
                            />
                        )}
                        {extraButtonTitle && onExtraButtonPress && (
                            <Button
                                title={extraButtonTitle}
                                type={extraButtonType}
                                onPress={onExtraButtonPress}
                                style={[
                                    extraButtonStyle,
                                    fillButtonsOnMobile && styles.fillButton,
                                ]}
                                textStyle={extraButtonTextStyle}
                            />
                        )}
                        {filterPlacement !== 'withSearch' && filterComponent}
                    </View>
                    {filterSectionProps && (
                        <GenericFilterSection
                            showFilters={showFilters}
                            {...filterSectionProps}
                        />
                    )}
                </PrimaryActionFade>
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
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
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
        flex: 1,
        minWidth: 180,
    },
    searchInputContainerFocused: {
        borderColor: '#5844BB',
        ...(Platform.OS === 'web' && {
            boxShadow: '0 0 0 3px rgba(88, 68, 187, 0.15)',
        }),
    },
    searchInputWithFilter: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 180,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 0,
        ...(Platform.OS === 'web' && {
            outlineStyle: 'none',
            outlineWidth: 0,
        }),
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
    buttonSectionSeparated: {
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#e4e4e4',
    },
    actionsLabel: {
        fontSize: 13,
        color: '#555',
        fontWeight: '600',
        marginBottom: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    buttonContainerStart: {
        justifyContent: 'flex-start',
    },
    buttonContainerFill: {
        alignItems: 'stretch',
    },
    fillButton: {
        flexGrow: 1,
        flexBasis: 0,
        minWidth: 0,
    },
}
export default SearchSection
