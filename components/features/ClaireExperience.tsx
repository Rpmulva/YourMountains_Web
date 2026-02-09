import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../constants/theme';

// MOCK BRAIN
const getClaireResponse = async (userText: string) => {
    return new Promise<string>((resolve) => {
        setTimeout(() => {
            const lower = userText.toLowerCase();
            if (lower.includes('trail') || lower.includes('hike')) return resolve("I recommend the Miners Creek Trail. It's 4.2 miles with epic views!");
            if (lower.includes('weather') || lower.includes('rain')) return resolve("Clear skies in Frisco right now, but always pack a shell!");
            if (lower.includes('hello')) return resolve("Hey! I'm Claire, your AI Guide. Where are we exploring?");
            resolve("That sounds like an adventure! Tell me more.");
        }, 1200); 
    });
};

interface Message { id: string; text: string; sender: 'user' | 'claire'; }

export default function ClaireExperience({ onClose, initialPrompt }: { onClose: () => void, initialPrompt?: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hi, I'm Claire. How can I help?", sender: 'claire' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const hasRunInitial = useRef(false);
    const flatListRef = useRef<FlatList>(null);

    // AUTO-SEND
    useEffect(() => {
        if (initialPrompt && !hasRunInitial.current) {
            hasRunInitial.current = true;
            handleSend(initialPrompt);
        }
    }, [initialPrompt]);

    const handleSend = async (textToUse?: string) => {
        const text = textToUse || inputText;
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);
        Keyboard.dismiss();

        const responseText = await getClaireResponse(userMsg.text);
        
        setIsTyping(false);
        const claireMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: 'claire' };
        setMessages(prev => [...prev, claireMsg]);
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.msgRow, isUser ? styles.msgRowRight : styles.msgRowLeft]}>
                {!isUser && (
                    <View style={styles.avatar}>
                        <MaterialCommunityIcons name="sparkles" size={18} color="#FFF" />
                    </View>
                )}
                <View style={[styles.bubble, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
                    <Text style={[styles.msgText, isUser ? styles.textRight : styles.textLeft]}>
                        {item.text}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <View style={styles.dragHandle} />
            
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.headerIconContainer}>
                        <MaterialCommunityIcons 
                            name="sparkles" 
                            size={24} 
                            color={Colors.claire.primary} 
                        />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Claire</Text>
                        <Text style={styles.headerSubtitle}>AI Adventure Guide</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={onClose}
                    style={styles.closeButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close" size={24} color={Colors.ui.textSecondary} />
                </TouchableOpacity>
            </View>

            <FlatList 
                ref={flatListRef} 
                data={messages} 
                renderItem={renderItem} 
                keyExtractor={item => item.id} 
                style={styles.list}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            
            {isTyping && (
                <View style={styles.typing}>
                    <ActivityIndicator size="small" color={Colors.claire.primary} />
                    <Text style={styles.typingText}>Claire is thinking...</Text>
                </View>
            )}
            
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.input} 
                    placeholder="Ask Claire anything..." 
                    placeholderTextColor={Colors.ui.textTertiary} 
                    value={inputText} 
                    onChangeText={setInputText} 
                    onSubmitEditing={() => handleSend()}
                    multiline
                />
                <TouchableOpacity 
                    onPress={() => handleSend()} 
                    style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                    disabled={!inputText.trim()}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons 
                        name="arrow-up" 
                        size={20} 
                        color={inputText.trim() ? '#FFF' : Colors.ui.textTertiary} 
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: Colors.ui.background, 
        borderTopLeftRadius: Radius.xl, 
        borderTopRightRadius: Radius.xl, 
        overflow: 'hidden' 
    },
    dragHandle: { 
        width: 40, 
        height: 4, 
        backgroundColor: Colors.ui.border, 
        alignSelf: 'center', 
        marginTop: Spacing.sm,
        borderRadius: Radius.sm,
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: Spacing.md, 
        borderBottomWidth: 1, 
        borderColor: Colors.ui.border,
        backgroundColor: '#1A1A1A', // Fully opaque
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${Colors.claire.primary}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    headerTitle: { 
        ...Typography.h3,
        color: Colors.claire.primary,
        marginBottom: 2,
    },
    headerSubtitle: {
        ...Typography.caption,
        color: Colors.ui.textSecondary,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    list: { 
        flex: 1,
    },
    listContent: {
        padding: Spacing.md,
    },
    msgRow: { 
        flexDirection: 'row', 
        marginBottom: Spacing.md,
        alignItems: 'flex-end',
    },
    msgRowLeft: { 
        justifyContent: 'flex-start',
    },
    msgRowRight: { 
        justifyContent: 'flex-end',
    },
    
    avatar: { 
        width: 32, 
        height: 32, 
        borderRadius: 16, 
        backgroundColor: Colors.claire.primary, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: Spacing.sm,
        ...Shadows.sm,
    },
    
    bubble: { 
        maxWidth: '75%', 
        padding: Spacing.md, 
        borderRadius: Radius.lg,
    },
    bubbleLeft: { 
        backgroundColor: '#1A1A1A', // Fully opaque
        borderBottomLeftRadius: Radius.xs,
    },
    bubbleRight: { 
        backgroundColor: Colors.claire.primary,
        borderBottomRightRadius: Radius.xs,
    },
    
    msgText: { 
        ...Typography.body,
        lineHeight: 22,
    },
    textLeft: { 
        color: Colors.ui.text,
    },
    textRight: { 
        color: '#FFF',
    },
    
    typing: { 
        flexDirection: 'row', 
        alignItems: 'center',
        paddingHorizontal: Spacing.md, 
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    typingText: { 
        ...Typography.small,
        color: Colors.claire.primary, 
        marginLeft: Spacing.sm,
        fontStyle: 'italic',
    },
    
    inputContainer: { 
        flexDirection: 'row', 
        padding: Spacing.md, 
        backgroundColor: '#1A1A1A', // Fully opaque 
        paddingBottom: 40, 
        borderTopWidth: 1, 
        borderColor: Colors.ui.border,
        alignItems: 'flex-end',
    },
    input: { 
        flex: 1, 
        backgroundColor: '#252525', // Fully opaque 
        borderRadius: Radius.round, 
        paddingHorizontal: Spacing.md, 
        minHeight: 48,
        maxHeight: 120,
        ...Typography.body,
        color: Colors.ui.text,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.sm,
    },
    sendBtn: { 
        width: 48, 
        height: 48, 
        borderRadius: 24, 
        backgroundColor: Colors.claire.primary, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginLeft: Spacing.sm,
        ...Shadows.md,
    },
    sendBtnDisabled: {
        backgroundColor: '#252525', // Fully opaque
        opacity: 0.5,
    },
});