import { useRef, useState } from 'react'
import { format } from 'date-fns'

/**
 * Week calendar meal drag-and-drop: measure day windows and resolve drop target.
 */
const useWeekMealDrag = ({ dates, dayRefs, onDrop }) => {
    const [draggingMeal, setDraggingMeal] = useState(null)
    const [dropTargetDate, setDropTargetDate] = useState(null)
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
    const [isScrollEnabled, setIsScrollEnabled] = useState(true)

    const draggingMealRef = useRef(null)
    const draggingFromDateRef = useRef(null)
    const screenPositionsRef = useRef(new Map())
    const dayHeightsRef = useRef(new Map())
    const [dayLayouts, setDayLayouts] = useState(new Map())

    const handleDayLayout = (dateKey, layout) => {
        if (dateKey && layout.height) {
            dayHeightsRef.current.set(dateKey, layout.height)
        }

        let cumulativeY = 0
        const updatedLayouts = new Map()

        dates.forEach((date) => {
            const key = format(date, 'yyyy-MM-dd')
            const height = dayHeightsRef.current.get(key) || 0

            if (height > 0) {
                updatedLayouts.set(key, {
                    y: cumulativeY,
                    height,
                })
                cumulativeY += height
            }
        })

        setDayLayouts(updatedLayouts)
    }

    const handleDragStart = (meal, date) => {
        screenPositionsRef.current = new Map()

        dates.forEach((d, index) => {
            const dateKey = format(d, 'yyyy-MM-dd')
            const ref = dayRefs.current.get(dateKey)
            if (ref) {
                ref.measureInWindow((x, y, width, height) => {
                    screenPositionsRef.current.set(dateKey, {
                        y,
                        height,
                        index,
                    })
                })
            }
        })

        try {
            draggingMealRef.current = meal
            draggingFromDateRef.current = date
            setDraggingMeal(meal)
            setIsScrollEnabled(false)
        } catch {
            // Silent fail for drag start
        }
    }

    const findDropTargetAtPosition = (absoluteY) => {
        let targetDate = null

        screenPositionsRef.current.forEach((position, dateKey) => {
            const { y, height } = position
            if (absoluteY >= y && absoluteY <= y + height) {
                const foundDate = dates.find(
                    (d) => format(d, 'yyyy-MM-dd') === dateKey
                )
                if (foundDate) {
                    targetDate = foundDate
                }
            }
        })

        return targetDate
    }

    const handleDragging = (absoluteY) => {
        try {
            if (screenPositionsRef.current.size === 0) return
            setDropTargetDate(findDropTargetAtPosition(absoluteY))
        } catch {
            // Silent fail for dragging
        }
    }

    const handleDragPosition = (absoluteX, absoluteY) => {
        setDragPosition({ x: absoluteX, y: absoluteY })
    }

    const handleDragEnd = (finalAbsoluteY) => {
        try {
            const meal = draggingMealRef.current
            const fromDate = draggingFromDateRef.current
            const finalDropTarget = finalAbsoluteY
                ? findDropTargetAtPosition(finalAbsoluteY)
                : dropTargetDate

            if (meal && finalDropTarget && fromDate) {
                const fromDateStr = format(fromDate, 'yyyy-MM-dd')
                const toDateStr = format(finalDropTarget, 'yyyy-MM-dd')
                if (fromDateStr !== toDateStr) {
                    onDrop(meal, fromDate, finalDropTarget)
                }
            }

            draggingMealRef.current = null
            draggingFromDateRef.current = null
            screenPositionsRef.current.clear()
            setDraggingMeal(null)
            setDropTargetDate(null)
            setDragPosition({ x: 0, y: 0 })
            setIsScrollEnabled(true)
        } catch {
            screenPositionsRef.current.clear()
            setIsScrollEnabled(true)
        }
    }

    return {
        draggingMeal,
        dropTargetDate,
        dragPosition,
        isScrollEnabled,
        dayLayouts,
        handleDayLayout,
        handleDragStart,
        handleDragging,
        handleDragPosition,
        handleDragEnd,
    }
}

export default useWeekMealDrag
