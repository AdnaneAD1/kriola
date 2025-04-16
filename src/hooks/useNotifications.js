import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [readNotifications, setReadNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/notifications');
            setNotifications(response.data.notifications);
            setReadNotifications(response.data.read);
            setUnreadNotifications(response.data.unread);
            setNotificationCount(response.data.notificationcount);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des notifications');
            console.error('Erreur lors du chargement des notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`/api/notifications/${notificationId}/read`);
            // Mettre à jour l'état local immédiatement
            setNotifications(prevNotifications =>
                prevNotifications.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read: true }
                        : notif
                )
            );
            // Rafraîchir les compteurs
            await fetchNotifications();
        } catch (err) {
            console.error('Erreur lors du marquage de la notification comme lue:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return {
        notifications,
        readNotifications,
        unreadNotifications,
        notificationCount,
        loading,
        error,
        markAsRead,
        refresh: fetchNotifications,
    };
};
