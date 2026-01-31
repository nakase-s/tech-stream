'use server';

// Disable keeping the process alive after execution to play nice with Next.js serverless environment if needed.
import { Innertube, UniversalCache } from 'youtubei.js';

const geminiApiKey = process.env.GEMINI_API_KEY!;
const youtubeApiKey = process.env.YOUTUBE_API_KEY!;

interface ReportResult {
    success: boolean;
    markdown?: string;
    error?: string;
}

// Singleton instance for Innertube
let youtube: Innertube | null = null;

async function getYoutubeClient() {
    if (youtube) return youtube;

    try {
        youtube = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
        });
        return youtube;
    } catch (e) {
        console.error('Failed to initialize Innertube:', e);
        return null;
    }
}

// Helper: Fetch Metadata via Official API
async function fetchMetadataFromOfficialApi(videoId: string) {
    if (!youtubeApiKey) return null;
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeApiKey}`
        );
        if (!response.ok) return null;
        const data = await response.json();
        if (!data.items || data.items.length === 0) return null;

        const snippet = data.items[0].snippet;
        return {
            title: snippet.title,
            description: snippet.description
        };
    } catch (e) {
        console.error('Official API fetch failed:', e);
        return null;
    }
}

export async function generateVideoReport(videoId: string): Promise<ReportResult> {
    if (!videoId) {
        return { success: false, error: 'Invalid Video ID' };
    }

    let sourceText = '';
    let sourceType: 'transcript' | 'description' = 'transcript';
    let videoTitle = '';

    // --- STRATEGY TIER A & B: Try youtubei.js (Transcript -> Description) ---
    try {
        const yt = await getYoutubeClient();
        if (yt) {
            const info = await yt.getInfo(videoId);
            videoTitle = info.basic_info.title || '';
            const description = info.basic_info.short_description || '';

            // 1. Try Transcript
            try {
                const transcriptData = await info.getTranscript();
                if (transcriptData?.transcript?.content?.body?.initial_segments) {
                    sourceText = transcriptData.transcript.content.body.initial_segments
                        .map((segment: any) => segment.snippet?.text)
                        .filter((text: any) => typeof text === 'string')
                        .join(' ');
                    sourceType = 'transcript';
                }
            } catch (e) {
                // console.log('Transcript unavailable, falling back to description.');
            }

            // 2. Fallback to Description if Transcript failed
            if (!sourceText && description) {
                sourceText = description;
                sourceType = 'description';
            }
        }
    } catch (e) {
        console.error('youtubei.js failed:', e);
    }

    // --- STRATEGY TIER C: Fallback to Official API (if youtubei.js failed completely) ---
    if (!sourceText) {
        // console.log('Falling back to Official Data API...');
        const metadata = await fetchMetadataFromOfficialApi(videoId);
        if (metadata) {
            sourceText = metadata.description;
            videoTitle = metadata.title || videoTitle;
            sourceType = 'description';
        }
    }

    // --- FINAL CHECK ---
    if (!sourceText) {
        return { success: false, error: '動画データの取得に失敗しました (No Transcript or Description available).' };
    }

    // --- GENERATE REPORT ---
    if (!geminiApiKey) {
        return { success: false, error: 'Gemini API Key is missing.' };
    }

    const prompt = sourceType === 'transcript'
        ? `
        以下の動画の字幕テキストを元に、非常に詳細で包括的なレポートを作成してください。
        
        【重要事項】
        1. **省略なし**: 動画の重要な論点、数値、専門用語、コードのロジックなどは決して省略せず、すべて網羅してください。
        2. **セクションごとの詳細解説**: 全体を短くまとめるのではなく、動画の流れに沿ってセクション（章）を分け、各パートを深く掘り下げて解説してください。長文になっても構いません。
        3. **構成**:
           - **はじめに**: 動画の背景と目的
           - **詳細内容**: (ここがメインです。H2「##」見出しを使用し、トピックごとに詳細に記述してください)
           - **まとめ・結論**: 重要なポイントの再確認
        
        【動画タイトル】
        ${videoTitle}

        【字幕テキスト】
        ${sourceText.slice(0, 50000)} 
        `
        : `
        以下の動画の概要欄(Description)を元に、できる限り詳細なレポートを作成してください。
        字幕が取得できなかったため、概要欄の情報を使用します。
        
        【要件】
        - 概要欄の情報を最大限に活用し、箇条書きなどで構造化して記述してください。
        - 可能な限り具体的な情報（ツール名、バージョン、手順など）を含めてください。
        
        【動画タイトル】
        ${videoTitle}

        【概要欄テキスト】
        ${sourceText.slice(0, 15000)} 
        `;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error('Gemini API Error:', errText);
            return { success: false, error: 'AIレポートの生成に失敗しました。' };
        }

        const data = await response.json();
        const markdown = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!markdown) {
            return { success: false, error: 'AIからの応答が空でした。' };
        }

        return { success: true, markdown };

    } catch (error) {
        console.error('generateVideoReport error:', error);
        return { success: false, error: '予期せぬエラーが発生しました。' };
    }
}
