import { ColorPalettes, FontSize, FontWeight, Radius, Spacing } from './tokens';
import { ColorValue } from 'react-native';
export interface ThemeColors {
    text: ColorValue | undefined | string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
}

export interface Theme {
    dark: boolean;
    colors: ThemeColors;
    spacing: typeof Spacing;
    radius: typeof Radius;
    fontSize: typeof FontSize;
    fontWeight: typeof FontWeight;
}

export const LightTheme: Theme = {
    dark: false,
    colors: {
        background: ColorPalettes.white,
        foreground: ColorPalettes.zinc[950], // oklch(0.145 0 0) approx
        card: ColorPalettes.white,
        cardForeground: ColorPalettes.zinc[950],
        popover: ColorPalettes.white,
        popoverForeground: ColorPalettes.zinc[950],
        primary: '#2563eb', // Vibrant Blue matching Figma mockups
        primaryForeground: ColorPalettes.white,
        secondary: ColorPalettes.zinc[100], // Approximate
        secondaryForeground: '#030213',
        muted: '#ececf0', // Exact hex from globals.css
        mutedForeground: '#717182', // Exact hex
        accent: '#e9ebef', // Exact hex
        accentForeground: '#030213',
        destructive: '#d4183d', // Exact hex
        destructiveForeground: ColorPalettes.white,
        border: 'rgba(0, 0, 0, 0.1)', // Exact
        input: ColorPalettes.transparent,
        ring: ColorPalettes.zinc[400],
        text: '#000',
    },
    spacing: Spacing,
    radius: Radius,
    fontSize: FontSize,
    fontWeight: FontWeight,
};

export const DarkTheme: Theme = {
    dark: true,
    colors: {
        background: ColorPalettes.zinc[950], // oklch(0.145 0 0) approx
        foreground: ColorPalettes.zinc[50], // oklch(0.985 0 0) approx
        card: ColorPalettes.zinc[950],
        cardForeground: ColorPalettes.zinc[50],
        popover: ColorPalettes.zinc[950],
        popoverForeground: ColorPalettes.zinc[50],
        primary: ColorPalettes.zinc[50],
        primaryForeground: ColorPalettes.zinc[900], // oklch(0.205 0 0) approx
        secondary: ColorPalettes.zinc[800], // oklch(0.269 0 0) approx
        secondaryForeground: ColorPalettes.zinc[50],
        muted: ColorPalettes.zinc[800],
        mutedForeground: ColorPalettes.zinc[400],
        accent: ColorPalettes.zinc[800],
        accentForeground: ColorPalettes.zinc[50],
        destructive: ColorPalettes.red[900], // Approx oklch(0.396 0.141 25.723)
        destructiveForeground: ColorPalettes.red[200], // Approx oklch(0.637 0.237 25.331)
        border: ColorPalettes.zinc[800],
        input: ColorPalettes.zinc[800],
        ring: ColorPalettes.zinc[600],
        text: '#fff',
    },
    spacing: Spacing,
    radius: Radius,
    fontSize: FontSize,
    fontWeight: FontWeight,
};
