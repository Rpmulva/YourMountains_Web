import { Colors } from '../constants/theme';

/**
 * Component config palette.
 *
 * Canonical names below match the v1.1 brand vocabulary
 * (orange, green, blue, yellow, brown, sandstone + tonal derivatives).
 * Prefer these in new code.
 *
 * Legacy aliases (claireOrange, exploringGold, enablementBlue, communityGreen,
 * hickory, etc.) are retained as compatibility shims pointing to the same
 * v1.1 token values. They are deprecated and will be swept by the
 * "Hex Palette Audit & Cleanup" follow-up PR — do not add new ones.
 */
const config = {
    colors: {
        // ===== The Six (v1.1 canon) =====
        orange:    Colors.tokens.orange,
        green:     Colors.tokens.green,
        blue:      Colors.tokens.blue,
        yellow:    Colors.tokens.yellow,
        brown:     Colors.tokens.brown,
        sandstone: Colors.tokens.sandstone,

        // ===== Tonal derivatives =====
        brownDeep:      Colors.tokens.brownDeep,
        brownInk:       Colors.tokens.brownInk,
        brownInk2:      Colors.tokens.brownInk2,
        brownInkMuted:  Colors.tokens.brownInkMuted,
        sandstone2:     Colors.tokens.sandstone2,
        sandstone3:     Colors.tokens.sandstone3,

        // ===== Legacy aliases (deprecated; use canonical names above) =====
        primary:         Colors.tokens.orange,
        claireOrange:    Colors.tokens.orange,
        communityGreen:  Colors.tokens.green,
        enablementBlue:  Colors.tokens.blue,
        exploringGold:   Colors.tokens.yellow, // "gold" maps to brand yellow per v1.1
        hickory:         Colors.tokens.brownDeep,
        background:      Colors.tokens.sandstone,
        card:            Colors.tokens.sandstone2,
        text:            Colors.tokens.brownInk,
        textSec:         Colors.tokens.brownInk2,
    }
};

export default config;
