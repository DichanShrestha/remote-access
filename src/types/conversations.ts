export interface ConversationSummary {
    sessionId: string;
    firstMessage: string;
    lastMessage: string;
    messageCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ConversationMessage {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
}
