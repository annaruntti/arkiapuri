import { StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'

export const FOOD_SEARCH_TABS = {
    ALL: 'all',
    LOCAL: 'local',
    OPEN_FOOD_FACTS: 'openfoodfacts',
}

/**
 * Source filter tabs for UnifiedFoodSearch results.
 */
const FoodSearchSourceTabs = ({
    activeTab,
    onChange,
    localCount = 0,
    openFoodFactsCount = 0,
}) => (
    <View style={styles.tabContainer}>
        <TouchableOpacity
            style={[
                styles.tab,
                activeTab === FOOD_SEARCH_TABS.ALL && styles.activeTab,
            ]}
            onPress={() => onChange(FOOD_SEARCH_TABS.ALL)}
        >
            <CustomText
                style={[
                    styles.tabText,
                    activeTab === FOOD_SEARCH_TABS.ALL && styles.activeTabText,
                ]}
            >
                {`Kaikki (${localCount + openFoodFactsCount})`}
            </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
            style={[
                styles.tab,
                activeTab === FOOD_SEARCH_TABS.LOCAL && styles.activeTab,
            ]}
            onPress={() => onChange(FOOD_SEARCH_TABS.LOCAL)}
        >
            <CustomText
                style={[
                    styles.tabText,
                    activeTab === FOOD_SEARCH_TABS.LOCAL &&
                        styles.activeTabText,
                ]}
            >
                {`Omat (${localCount})`}
            </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
            style={[
                styles.tab,
                activeTab === FOOD_SEARCH_TABS.OPEN_FOOD_FACTS &&
                    styles.activeTab,
            ]}
            onPress={() => onChange(FOOD_SEARCH_TABS.OPEN_FOOD_FACTS)}
        >
            <CustomText
                style={[
                    styles.tabText,
                    activeTab === FOOD_SEARCH_TABS.OPEN_FOOD_FACTS &&
                        styles.activeTabText,
                ]}
            >
                {`Tietokanta (${openFoodFactsCount})`}
            </CustomText>
        </TouchableOpacity>
    </View>
)

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#5844BB',
    },
    tabText: {
        fontSize: 12,
        color: '#666',
    },
    activeTabText: {
        color: '#5844BB',
        fontWeight: 'bold',
    },
})

export default FoodSearchSourceTabs
