import { supabase } from '../supabase';

export const THEME_COLOR_CATEGORIES = {
    primary: {
        fields: ['primary_color_dark', 'primary_color_light'],
        label: 'Primary Colors',
        hint: 'Main brand colors - used for primary UI elements and accents',
    },
    secondary: {
        fields: ['secondary_color_dark', 'secondary_color_light'],
        label: 'Secondary Colors',
        hint: 'Secondary brand colors - used for secondary UI elements',
    },
    backdrop: {
        fields: ['backdrop_base', 'backdrop_glow'],
        label: 'Backdrop Colors',
        hint: 'Background and glow effects for the page backdrop',
    },
    background: {
        fields: [
            'background_blob_one',
            'background_blob_two',
            'background_blob_three',
            'background_blob_four',
            'background_grid_line',
        ],
        label: 'Background Elements',
        hint: 'Animated blobs and grid overlay colors',
    },
    text: {
        fields: ['text_primary', 'text_secondary'],
        label: 'Text Colors',
        hint: 'Text colors for primary and secondary content',
    },
    border: {
        fields: ['border_light', 'border_dark'],
        label: 'Border Colors',
        hint: 'Border colors for light and dark contexts',
    },
};

export const DEFAULT_THEME = {
    primary_color_dark: '#6366f1',
    primary_color_light: '#a855f7',
    secondary_color_dark: '#8b5cf6',
    secondary_color_light: '#c084fc',
    backdrop_base: '#030014',
    backdrop_glow: '#1b123d',
    background_blob_one: '#6366f1',
    background_blob_two: '#a855f7',
    background_blob_three: '#ec4899',
    background_blob_four: '#8b5cf6',
    background_grid_line: '#6366f1',
    text_primary: '#f5f3ff',
    text_secondary: '#d8d4e8',
    border_light: '#e5e0ff',
    border_dark: '#3d394e',
};

export const fetchTheme = async () => {
    try {
        const { data, error } = await supabase
            .from('site_theme')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw error;

        return data || DEFAULT_THEME;
    } catch (error) {
        console.error('Error fetching theme:', error);
        return DEFAULT_THEME;
    }
};

export const updateTheme = async (colors) => {
    try {
        const { data, error } = await supabase
            .from('site_theme')
            .update(colors)
            .eq('id', 1)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error updating theme:', error);
        throw error;
    }
};

export const resetTheme = async () => {
    try {
        const { data, error } = await supabase
            .from('site_theme')
            .update(DEFAULT_THEME)
            .eq('id', 1)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error resetting theme:', error);
        throw error;
    }
};
