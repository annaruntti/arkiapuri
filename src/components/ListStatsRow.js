import { createContext, useCallback, useContext, useState } from 'react'
import { StyleSheet, View } from 'react-native'

const ListSortPanelContext = createContext(null)

export const useListSortPanelSlot = () => useContext(ListSortPanelContext)

/**
 * Shared count + actions row for pantry, meals, and shopping lists.
 * Sort and filter buttons belong in `actions`, typically Järjestä then Suodata.
 * Sort options render below the full row so they are not clipped on mobile.
 */
const ListStatsRow = ({ children, actions }) => {
    const [sortPanel, setSortPanel] = useState(null)
    const registerSortPanel = useCallback((node) => {
        setSortPanel(node)
    }, [])

    return (
        <ListSortPanelContext.Provider value={registerSortPanel}>
            <View style={styles.block}>
                <View style={styles.stats}>
                    <View style={styles.statsContent}>{children}</View>
                    {actions ? (
                        <View style={styles.statsActions}>{actions}</View>
                    ) : null}
                </View>
                {sortPanel}
            </View>
        </ListSortPanelContext.Provider>
    )
}

const styles = StyleSheet.create({
    block: {
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        marginBottom: 8,
        zIndex: 20,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
    },
    statsContent: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
        gap: 2,
        paddingRight: 8,
    },
    statsActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        flexShrink: 1,
        minWidth: 0,
        zIndex: 20,
    },
})

export default ListStatsRow
