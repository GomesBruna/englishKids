import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type ActivityType =
    | 'lesson_view'
    | 'game_start'
    | 'game_complete'
    | 'video_watch'
    | 'vocabulary_view';

export const useActivityLogger = () => {
    const { user, refreshProfile } = useAuth();

    const logActivity = async (
        type: ActivityType,
        name: string,
        pointsEarned: number = 0,
        metadata: any = {}
    ) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('user_activity_logs')
                .insert({
                    user_id: user.id,
                    activity_type: type,
                    activity_name: name,
                    points_earned: pointsEarned,
                    metadata
                });

            if (error) throw error;

            // Refresh context profile to show updated points/last active
            await refreshProfile();
        } catch (err) {
            console.error('Error logging activity:', err);
        }
    };

    return { logActivity };
};
