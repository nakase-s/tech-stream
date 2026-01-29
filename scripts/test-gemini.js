
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No GEMINI_API_KEY found in environment");
    process.exit(1);
}

async function testGemini() {
    const prompt = "Hello, are you working?";
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            }
        );

        if (!response.ok) {
            console.error('Gemini API Error Status:', response.status);
            console.error('Gemini API Error Text:', await response.text());
        } else {
            console.log('Gemini API Success:', await response.json());
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testGemini();
