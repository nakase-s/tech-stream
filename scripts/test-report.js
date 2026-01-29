
// Mock Env
process.env.GEMINI_API_KEY = "AIzaSyDIC9_wFvy0AxR9PiTfrWHl7GTkkBrbkYA";
process.env.YOUTUBE_API_KEY = "AIzaSyCYC9hPtRylO6Fzrn09HuZUqS4CY_7Myy0"; // Copied from .env.local

async function fetchMetadataFromOfficialApi(videoId) {
    console.log("Fetching from Official API...");
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
        );
        if (!response.ok) {
            console.error("API Response not ok:", await response.text());
            return null;
        }
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

async function testFallback() {
    const videoId = "M7lc1UVf-VE"; // YouTube Developers video (Should exist)
    console.log(`Testing fallback for video: ${videoId}`);

    // Simulate youtubei.js failure by directly calling the fallback
    console.log("[SIMULATION] Tier A & B (youtubei.js) failed.");

    const metadata = await fetchMetadataFromOfficialApi(videoId);

    if (metadata) {
        console.log("Tier C (Official API) Success!");
        console.log(`Title: ${metadata.title}`);
        console.log(`Description Preview: ${metadata.description.slice(0, 50)}...`);

        console.log("Testing Gemini Generation with Description...");
        const prompt = `
        以下の動画の概要欄(Description)を元に、内容のレポートを作成してください。
        字幕が取得できなかったため、概要欄の情報を使用します。
        
        【要件】
        - ソース: 概要欄 (Description)
        - 概要欄にある情報を整理し、可能な限り詳細なレポートを作成してください。
        - 読みやすいMarkdown形式で出力してください。
        
        【動画タイトル】
        ${metadata.title}

        【概要欄テキスト】
        ${metadata.description.slice(0, 10000)} 
        `;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) {
            console.error("Gemini Error:", await response.text());
        } else {
            const data = await response.json();
            console.log("Gemini Success! Output:");
            console.log(data.candidates?.[0]?.content?.parts?.[0]?.text.slice(0, 200) + "...");
        }

    } else {
        console.error("Tier C (Official API) Failed.");
    }
}

testFallback();
