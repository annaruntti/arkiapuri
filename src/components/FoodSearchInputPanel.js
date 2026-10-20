import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import CustomText from './CustomText'
import FoodSearchSourceTabs from './FoodSearchSourceTabs'

/**
 * Search field, optional barcode button, and tabbed results list.
 */
const FoodSearchInputPanel = ({
    searchQuery,
    onSearchChange,
    onFocusSearch,
    loading,
    showBarcodeButton,
    onOpenScanner,
    isListVisible,
    activeTab,
    onChangeTab,
    localCount,
    openFoodFactsCount,
    results,
    renderResult,
    resultsKey,
}) => (
    <>
        <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Hae tuotteita nimellä..."
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    onFocus={onFocusSearch}
                />
                {loading && (
                    <ActivityIndicator
                        size="small"
                        color="#5844BB"
                        style={styles.loadingIndicator}
                    />
                )}
            </View>
            {showBarcodeButton ? (
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={onOpenScanner}
                    accessibilityRole="button"
                    accessibilityLabel="Skannaa viivakoodi"
                >
                    <Ionicons name="barcode" size={24} color="#5844BB" />
                </TouchableOpacity>
            ) : null}
        </View>

        {isListVisible && searchQuery.length >= 2 && (
            <View style={styles.resultsContainer}>
                <FoodSearchSourceTabs
                    activeTab={activeTab}
                    onChange={onChangeTab}
                    localCount={localCount}
                    openFoodFactsCount={openFoodFactsCount}
                />

                {results.length === 0 && !loading ? (
                    <View style={styles.emptyContainer}>
                        <CustomText style={styles.emptyText}>
                            {`Ei tuloksia haulle "${searchQuery}"`}
                        </CustomText>
                    </View>
                ) : (
                    <ScrollView
                        key={resultsKey}
                        style={styles.resultsList}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                    >
                        {results.map((item, index) =>
                            renderResult({ item, index })
                        )}
                    </ScrollView>
                )}
            </View>
        )}
    </>
)

const styles = StyleSheet.create({
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        alignSelf: 'center',
    },
    searchInputContainer: {
        flex: 1,
        position: 'relative',
        width: '100%',
        alignSelf: 'center',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    loadingIndicator: {
        position: 'absolute',
        right: 12,
        top: '50%',
        marginTop: -10,
    },
    scanButton: {
        padding: 8,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#5844BB',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultsContainer: {
        marginTop: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        maxHeight: 380,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
    resultsList: {
        maxHeight: 280,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
})

export default FoodSearchInputPanel
