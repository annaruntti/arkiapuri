import { useState } from 'react'
import { StyleSheet } from 'react-native'
import ContentContainer from '../components/ContentContainer'
import LoginPromptModal from '../components/LoginPromptModal'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ScreenTabBar from '../components/ScreenTabBar'
import TableMonth from '../components/TableMonth'
import TableWeek from '../components/TableWeek'
import useLoginPrompt from '../hooks/useLoginPrompt'

const TABS = [
    { id: 'week', label: 'Viikko' },
    { id: 'month', label: 'Kuukausi' },
]

const ReadingOrderScreen = ({}) => {
    const { showLoginPrompt, loginPromptProps } = useLoginPrompt()
    const [activeTab, setActiveTab] = useState('week')

    const handleRequireLogin = (trigger = 'sync', action = null) => {
        showLoginPrompt(trigger, action)
    }

    return (
        <ResponsiveLayout
            activeRoute="ReadingOrderStack"
            contentBackgroundColor="#f9fafb"
        >
            <ScreenTabBar
                tabs={TABS}
                activeId={activeTab}
                onChange={setActiveTab}
            >
                <ContentContainer style={styles.weekContent}>
                    {activeTab === 'week' ? (
                        <TableWeek onRequireLogin={handleRequireLogin} />
                    ) : (
                        <TableMonth onRequireLogin={handleRequireLogin} />
                    )}
                </ContentContainer>
                <LoginPromptModal {...loginPromptProps} />
            </ScreenTabBar>
        </ResponsiveLayout>
    )
}

export default ReadingOrderScreen

const styles = StyleSheet.create({
    weekContent: {
        overflow: 'visible',
    },
})
