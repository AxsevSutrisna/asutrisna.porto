import { useEffect } from 'react';
import { supabase } from '../supabase';
import { DEFAULT_THEME } from '../utils/themeManager';

const CSS_VAR_MAP = {
    primary_color_dark: '--color-primary-dark',
    primary_color_light: '--color-primary-light',
    secondary_color_dark: '--color-secondary-dark',
    secondary_color_light: '--color-secondary-light',
    backdrop_base: '--color-backdrop-base',
    backdrop_glow: '--color-backdrop-glow',
    background_blob_one: '--color-background-blob-one',
    background_blob_two: '--color-background-blob-two',
    background_blob_three: '--color-background-blob-three',
    background_blob_four: '--color-background-blob-four',
    background_grid_line: '--color-grid-line',
    background_grid_line_soft: '--color-grid-line-soft',
    state_success: '--color-state-success',
    state_warning: '--color-state-warning',
    state_error: '--color-state-error',
    state_info: '--color-state-info',
    text_primary: '--color-text-primary',
    text_secondary: '--color-text-secondary',
    text_tertiary: '--color-text-tertiary',
    border_light: '--color-border-light',
    border_dark: '--color-border-dark',
};

const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const hexToRgbTriplet = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
};

const injectCSSVariables = (colors) => {
    const root = document.documentElement;

    // Inject color variables
    Object.entries(CSS_VAR_MAP).forEach(([key, cssVar]) => {
        const value = colors[key] || DEFAULT_THEME[key];
        root.style.setProperty(cssVar, value);
    });

    // Inject RGB variants for color-mix
    if (colors.backdrop_base) {
        root.style.setProperty(
            '--color-backdrop-base-rgb',
            hexToRgbTriplet(colors.backdrop_base)
        );
    }

    if (colors.backdrop_glow) {
        root.style.setProperty(
            '--color-backdrop-glow-rgb',
            hexToRgbTriplet(colors.backdrop_glow)
        );
    }

    if (colors.primary_color_dark) {
        root.style.setProperty(
            '--color-primary-dark-rgb',
            hexToRgbTriplet(colors.primary_color_dark)
        );
    }

    if (colors.primary_color_light) {
        root.style.setProperty(
            '--color-primary-light-rgb',
            hexToRgbTriplet(colors.primary_color_light)
        );
    }

    // Inject grid line variants with proper opacity
    const gridBase = colors.background_grid_line || colors.primary_color_dark;
    const gridSoft = colors.background_grid_line_soft || colors.primary_color_dark;

    root.style.setProperty('--color-grid-line', hexToRgba(gridBase, 0.035));
    root.style.setProperty('--color-grid-line-soft', hexToRgba(gridSoft, 0.018));
};

export const useTheme = () => {
    useEffect(() => {
        const setupTheme = async () => {
            try {
                // Check localStorage cache
                const cached = localStorage.getItem('theme_colors');
                if (cached) {
                    const colors = JSON.parse(cached);
                    injectCSSVariables(colors);
                }

                // Fetch from Supabase
                const { data, error } = await supabase
                    .from('site_theme')
                    .select('*')
                    .eq('id', 1)
                    .single();

                if (error) throw error;

                if (data) {
                    // Extract color values
                    const colors = {
                        primary_color_dark: data.primary_color_dark || DEFAULT_THEME.primary_color_dark,
                        primary_color_light: data.primary_color_light || DEFAULT_THEME.primary_color_light,
                        secondary_color_dark: data.secondary_color_dark || DEFAULT_THEME.secondary_color_dark,
                        secondary_color_light: data.secondary_color_light || DEFAULT_THEME.secondary_color_light,
                        backdrop_base: data.backdrop_base || DEFAULT_THEME.backdrop_base,
                        backdrop_glow: data.backdrop_glow || DEFAULT_THEME.backdrop_glow,
                        background_blob_one: data.background_blob_one || DEFAULT_THEME.background_blob_one,
                        background_blob_two: data.background_blob_two || DEFAULT_THEME.background_blob_two,
                        background_blob_three: data.background_blob_three || DEFAULT_THEME.background_blob_three,
                        background_blob_four: data.background_blob_four || DEFAULT_THEME.background_blob_four,
                        background_grid_line: data.background_grid_line || DEFAULT_THEME.background_grid_line,
                        background_grid_line_soft: data.background_grid_line_soft || DEFAULT_THEME.background_grid_line_soft,
                        state_success: data.state_success || DEFAULT_THEME.state_success,
                        state_warning: data.state_warning || DEFAULT_THEME.state_warning,
                        state_error: data.state_error || DEFAULT_THEME.state_error,
                        state_info: data.state_info || DEFAULT_THEME.state_info,
                        text_primary: data.text_primary || DEFAULT_THEME.text_primary,
                        text_secondary: data.text_secondary || DEFAULT_THEME.text_secondary,
                        text_tertiary: data.text_tertiary || DEFAULT_THEME.text_tertiary,
                        border_light: data.border_light || DEFAULT_THEME.border_light,
                        border_dark: data.border_dark || DEFAULT_THEME.border_dark,
                    };

                    injectCSSVariables(colors);
                    localStorage.setItem('theme_colors', JSON.stringify(colors));
                }

                // Subscribe to real-time updates
                const subscription = supabase
                    .channel('site_theme_changes')
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'site_theme',
                            filter: 'id=eq.1',
                        },
                        (payload) => {
                            if (payload.new) {
                                const colors = {
                                    primary_color_dark: payload.new.primary_color_dark,
                                    primary_color_light: payload.new.primary_color_light,
                                    secondary_color_dark: payload.new.secondary_color_dark,
                                    secondary_color_light: payload.new.secondary_color_light,
                                    backdrop_base: payload.new.backdrop_base,
                                    backdrop_glow: payload.new.backdrop_glow,
                                    background_blob_one: payload.new.background_blob_one,
                                    background_blob_two: payload.new.background_blob_two,
                                    background_blob_three: payload.new.background_blob_three,
                                    background_blob_four: payload.new.background_blob_four,
                                    background_grid_line: payload.new.background_grid_line,
                                    background_grid_line_soft: payload.new.background_grid_line_soft,
                                    state_success: payload.new.state_success,
                                    state_warning: payload.new.state_warning,
                                    state_error: payload.new.state_error,
                                    state_info: payload.new.state_info,
                                    text_primary: payload.new.text_primary,
                                    text_secondary: payload.new.text_secondary,
                                    text_tertiary: payload.new.text_tertiary,
                                    border_light: payload.new.border_light,
                                    border_dark: payload.new.border_dark,
                                };
                                injectCSSVariables(colors);
                                localStorage.setItem('theme_colors', JSON.stringify(colors));
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(subscription);
                };
            } catch (error) {
                console.error('Error setting up theme:', error);
            }
        };

        setupTheme();
    }, []);
};
