import { useRef, useState } from 'react'
import { useLogin } from '../context/LoginProvider'

/**
 * useLoginPrompt
 *
 * Centralised hook for managing the LoginPromptModal across all screens.
 * Eliminates duplicated state/logic and fixes the race condition where
 * allowContinueWithoutLogin() (async React state) hadn't propagated yet
 * when the pending action was executed.
 *
 * KEY PATTERN for "continue without login":
 *   When calling showLoginPrompt(trigger, action), the `action` should be
 *   the work to perform DIRECTLY (e.g. open a modal) — NOT a function that
 *   re-checks authentication. This avoids the race condition entirely because
 *   the retry action bypasses the auth check.
 *
 * Usage:
 *   const { showLoginPrompt, loginPromptProps } = useLoginPrompt()
 *   // In your component:
 *   <LoginPromptModal {...loginPromptProps} />
 *   // When auth is needed:
 *   const token = await storage.getItem('userToken')
 *   if (!token) {
 *     showLoginPrompt('save', () => doTheActualWork())
 *     return
 *   }
 *   doTheActualWork(token)
 */
const useLoginPrompt = () => {
    const { isLoggedIn, continueWithoutLogin, allowContinueWithoutLogin } = useLogin()
    const [loginPromptVisible, setLoginPromptVisible] = useState(false)
    const [loginPromptTrigger, setLoginPromptTrigger] = useState('sync')

    // Use a ref so the pending action is available synchronously when
    // handleContinueWithoutLogin fires — no async state reads needed.
    const pendingActionRef = useRef(null)

    /**
     * Show the login prompt modal.
     * @param {string} trigger - LoginPromptModal triggerType ('sync', 'save', 'meal_create', etc.)
     * @param {Function|null} action - Action to run when user clicks "Jatka ilman kirjautumista".
     *   Should perform the actual work directly, NOT re-check authentication.
     */
    const showLoginPrompt = (trigger = 'sync', action = null) => {
        // If already authenticated or in guest mode, run the action immediately
        if (isLoggedIn || continueWithoutLogin) {
            if (action) action()
            return
        }
        pendingActionRef.current = action
        setLoginPromptTrigger(trigger)
        setLoginPromptVisible(true)
    }

    /**
     * Called when user clicks "Jatka ilman kirjautumista".
     * Sets the global guest-mode flag and immediately runs the pending action.
     */
    const handleContinueWithoutLogin = () => {
        allowContinueWithoutLogin()
        setLoginPromptVisible(false)
        const action = pendingActionRef.current
        pendingActionRef.current = null
        if (action) action()
    }

    /**
     * Dismiss the modal without taking any action (user closed it).
     */
    const dismissLoginPrompt = () => {
        setLoginPromptVisible(false)
        pendingActionRef.current = null
    }

    /**
     * Spread these props directly onto <LoginPromptModal />.
     * Example: <LoginPromptModal {...loginPromptProps} />
     */
    const loginPromptProps = {
        visible: loginPromptVisible,
        onClose: dismissLoginPrompt,
        triggerType: loginPromptTrigger,
        onContinueWithoutLogin: handleContinueWithoutLogin,
    }

    return {
        showLoginPrompt,
        dismissLoginPrompt,
        loginPromptProps,
    }
}

export default useLoginPrompt
