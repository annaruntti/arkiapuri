import { ScrollView, View } from 'react-native'
import CustomText from './CustomText'

/**
 * Shared dropdown body for sort and filter panels.
 * Triggers stay as ToggleButton pills; this is only the opened content.
 */
const ExpandableListPanel = ({
    visible = true,
    title,
    children,
    scrollable = false,
}) => {
    if (!visible) {
        return null
    }

    const body = (
        <View style={styles.container}>
            {title ? (
                <CustomText style={styles.title}>{title}</CustomText>
            ) : null}
            {children}
        </View>
    )

    return (
        <View style={styles.section}>
            {scrollable ? (
                <ScrollView
                    style={styles.scroll}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                >
                    {body}
                </ScrollView>
            ) : (
                body
            )}
        </View>
    )
}

export const ExpandableListChipRow = ({ children }) => (
    <View style={styles.chipRow}>{children}</View>
)

const styles = {
    section: {
        marginTop: 15,
        marginBottom: 15,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        alignSelf: 'stretch',
    },
    scroll: {
        maxHeight: 400,
    },
    container: {
        padding: 15,
        backgroundColor: 'rgb(248, 248, 248)',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
        borderRadius: 10,
        maxWidth: '100%',
        minWidth: 0,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
        maxWidth: '100%',
        minWidth: 0,
    },
}

export default ExpandableListPanel
