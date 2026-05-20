import { useCallback, useEffect, useRef, useState } from 'react'

export const useToast = () => {
    const [toasts, setToasts] = useState([])
    const timersRef = useRef(new Map())

    const removeToast = useCallback((id) => {
        const timer = timersRef.current.get(id)
        if (timer) {
            clearTimeout(timer)
            timersRef.current.delete(id)
        }

        setToasts((current) => current.filter((toast) => toast.id !== id))
    }, [])

    const pushToast = useCallback((type, message, timeout = 3500) => {
        const id = Math.random().toString(36).slice(2, 9)
        setToasts((current) => [...current, { id, type, message }])

        if (timeout > 0) {
            const timer = setTimeout(() => {
                setToasts((current) => current.filter((toast) => toast.id !== id))
                timersRef.current.delete(id)
            }, timeout)

            timersRef.current.set(id, timer)
        }

        return id
    }, [])

    useEffect(() => () => {
        timersRef.current.forEach((timer) => clearTimeout(timer))
        timersRef.current.clear()
    }, [])

    return { toasts, pushToast, removeToast }
}