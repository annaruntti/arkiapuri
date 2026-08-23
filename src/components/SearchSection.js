import { useState } from 'react'
import { Platform, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import BarcodeScanner from './BarcodeScanner'
import Button from './Button'
import CustomText from './CustomText'
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
    onBarcodeScanned,
}) => {
    const { isDesktop } = useResponsiveDimensions()
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [showScanner, setShowScanner] = useState(false)
    const showBarcodeScan = Boolean(onBarcodeScanned) && !isDesktop

    return (
        <View style={styles.searchSection}>
            <View style={styles.searchRow}>
                <View
                    style={[
                        styles.searchInputContainer,
                        showBarcodeScan
                            ? styles.searchInputWithScan
                            : styles.searchInputFullWidth,
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
                {showBarcodeScan ? (
                    <TouchableOpacity
                        style={styles.scanButton}
                        onPress={() => setShowScanner(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Skannaa viivakoodi"
                    >
                        <Ionicons name="barcode" size={24} color="#5844BB" />
                    </TouchableOpacity>
                ) : null}
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
                <PrimaryActionFade style={styles.buttonSection}>
                    {actionsLabel ? (
                        <CustomText style={styles.actionsLabel}>
                            {actionsLabel}
                        </CustomText>
                    ) : null}
                    <View style={styles.buttonContainer}>
                        {buttonTitle && onButtonPress && (
                            <Button
                                title={buttonTitle}
                                type={buttonType}
                                onPress={onButtonPress}
                                style={buttonStyle}
                                textStyle={buttonTextStyle}
                            />
                        )}
                        {extraButtonTitle && onExtraButtonPress && (
                            <Button
                                title={extraButtonTitle}
                                type={extraButtonType}
                                onPress={onExtraButtonPress}
                                style={extraButtonStyle}
                                textStyle={extraButtonTextStyle}
                            />
                        )}
                    </View>
                </PrimaryActionFade>
            )}

            {showBarcodeScan ? (
                <BarcodeScanner
                    isVisible={showScanner}
                    onCancel={() => setShowScanner(false)}
                    onScanSuccess={(barcode) => {
                        setShowScanner(false)
                        onBarcodeScanned(barcode)
                    }}
                />
            ) : null}
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
        width: '100%',
        alignSelf: 'stretch',
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
        minWidth: 0,
    },
    searchInputFullWidth: {
        width: '100%',
        flexGrow: 1,
        flexBasis: '100%',
        minWidth: '100%',
        alignSelf: 'stretch',
    },
    searchInputWithScan: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        minWidth: 0,
        width: undefined,
    },
    searchInputContainerFocused: {
        borderColor: '#5844BB',
        ...(Platform.OS === 'web' && {
            boxShadow: '0 0 0 3px rgba(88, 68, 187, 0.15)',
        }),
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        minWidth: 0,
        fontSize: 16,
        color: '#333',
        paddingVertical: 0,
        ...(Platform.OS === 'web' && {
            outlineStyle: 'none',
            outlineWidth: 0,
            width: '100%',
        }),
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    scanButton: {
        padding: 8,
        height: 40,
        minWidth: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#5844BB',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
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
}
export default SearchSection
