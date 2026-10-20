import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomText from '../components/CustomText'
import ContentContainer from '../components/ContentContainer'
import LoginPromptModal from '../components/LoginPromptModal'
import ResponsiveLayout from '../components/ResponsiveLayout'
import TableMonth from '../components/TableMonth'
import TableWeek from '../components/TableWeek'
import useLoginPrompt from '../hooks/useLoginPrompt'

const ReadingOrderScreen = ({}) => {
    const { showLoginPrompt, loginPromptProps } = useLoginPrompt()
    const [activeTab, setActiveTab] = useState('week')

    const handleRequireLogin = (trigger = 'sync', action = null) => {
        showLoginPrompt(trigger, action)
    }

    const renderTabButton = (tabKey, title) => (
        <TouchableOpacity
            key={tabKey}
            style={[
                styles.tabButton,
                activeTab === tabKey && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tabKey)}
        >
            <CustomText
                style={[
                    styles.tabButtonText,
                    activeTab === tabKey && styles.activeTabButtonText,
                ]}
            >
                {title}
            </CustomText>
        </TouchableOpacity>
    )

    return (
        <ResponsiveLayout
            activeRoute="ReadingOrderStack"
            contentBackgroundColor="#f9fafb"
        >
            <View style={styles.container}>
                {/* Content */}
                <View style={styles.contentContainer}>
                    <ContentContainer style={styles.weekContent}>
                        {activeTab === 'week' ? (
                            <TableWeek onRequireLogin={handleRequireLogin} />
                        ) : (
                            <TableMonth onRequireLogin={handleRequireLogin} />
                        )}
                    </ContentContainer>
                </View>

                <LoginPromptModal {...loginPromptProps} />

                {/* Tab Navigation is rendered last so it's on top */}
                <View style={styles.tabContainer}>
                    {renderTabButton('week', 'Viikko')}
                    {renderTabButton('month', 'Kuukausi')}
                </View>
            </View>
        </ResponsiveLayout>
    )
}

export default ReadingOrderScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        position: 'relative',
        overflow: 'visible',
    },
    tabContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
        zIndex: 10000000,
        elevation: 10000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabButton: {
        paddingVertical: 15,
        paddingHorizontal: 36,
        alignItems: 'center',
        backgroundColor: '#e9ecef',
        borderBottomWidth: 3,
        borderBottomColor: '#e9ecef',
    },
    activeTabButton: {
        backgroundColor: '#fff',
        borderBottomColor: '#5844BB',
        zIndex: 1,
        shadowColor: '#5844BB',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 4,
        elevation: 3,
        boxShadow: '0 1px 6px rgba(88, 68, 187, 0.22)',
    },
    tabButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    activeTabButtonText: {
        color: '#5844BB',
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        paddingTop: 53,
        overflow: 'visible',
    },
    weekContent: {
        overflow: 'visible',
    },
})
