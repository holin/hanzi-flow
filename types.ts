// Hanzi Writer types (simplified as we might not have the full @types package available in this env)
export interface HanziWriterOptions {
    width?: number;
    height?: number;
    padding?: number;
    showOutline?: boolean;
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    radicalColor?: string;
    strokeColor?: string;
    outlineColor?: string;
    drawingWidth?: number;
    showCharacter?: boolean;
    showHintAfterMisses?: number;
    highlightOnVariation?: boolean;
    onLoadCharDataError?: (error: any) => void;
    onLoadCharDataSuccess?: (data: any) => void;
    charDataLoader?: (char: string, onComplete: (data: any) => void, onErr: (msg: any) => void) => void;
}

export interface HanziWriterInstance {
    animateCharacter: (options?: { onComplete?: () => void }) => void;
    loopCharacterAnimation: () => void;
    quiz: (options?: { onComplete?: (summary: any) => void }) => void;
    cancelQuiz: () => void;
    hideCharacter: () => void;
    showCharacter: () => void;
    setCharacter: (char: string) => void;
}

// AI Response types
export interface VocabularyExample {
    word: string;
    pinyin: string;
    meaning: string;
}

export interface CharacterDetails {
    character: string;
    pinyin: string;
    definition: string;
    etymology: string; // Brief history/origin
    examples: VocabularyExample[];
}