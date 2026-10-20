import { StyleSheet, View } from 'react-native'

import CategorySectionHeader from './CategorySectionHeader'
import CustomText from './CustomText'

/**
 * Sectioned pantry rows (or empty-state message).
 */
const PantryItemsBody = ({
    sections,
    loading,
    searchQuery,
    renderItem,
    style,
}) => {
    const hasRows = sections.some((section) => section.data?.length)

    return (
        <View style={[styles.productList, styles.listContent, style]}>
            {hasRows
                ? sections.map((section) => (
                      <View key={section.title || 'pantry-section'}>
                          <CategorySectionHeader
                              title={section.title}
                              count={section.data.length}
                          />
                          {section.data.map((item, index) => (
                              <View
                                  key={String(
                                      item._id ||
                                          item.foodId?._id ||
                                          item.foodId ||
                                          `${item.name}-${index}`
                                  )}
                              >
                                  {renderItem({ item })}
                              </View>
                          ))}
                      </View>
                  ))
                : !loading && (
                      <CustomText style={styles.emptyText}>
                          {searchQuery.length > 0
                              ? `Hakusanalla "${searchQuery}" ei löytynyt tuotteita.`
                              : 'Pentterissäsi ei ole vielä elintarvikkeita. Skannaa säilytyspaikka tai lisää tuote manuaalisesti.'}
                      </CustomText>
                  )}
        </View>
    )
}

const styles = StyleSheet.create({
    productList: {
        width: '100%',
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
        paddingHorizontal: 20,
    },
})

export default PantryItemsBody
