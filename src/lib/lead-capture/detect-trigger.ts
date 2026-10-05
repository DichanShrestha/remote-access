import { KeywordTriggerGroup, TriggerReason } from "./config";

export function detectTriggerReason(
    message: string,
    groups: KeywordTriggerGroup[]
): TriggerReason | null {
    if (!groups || groups.length === 0) return null;

    const lowerMessage = message.toLowerCase();

    for (const group of groups) {
        if (!group.keywords || group.keywords.length === 0) continue;

        // Substring match
        const isMatch = group.keywords.some(keyword => {
            const lowerKw = keyword.toLowerCase().trim();
            if (!lowerKw) return false;
            return lowerMessage.includes(lowerKw);
        });

        if (isMatch) {
            return group.intentCategory;
        }
    }

    return null;
}
