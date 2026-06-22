(function() {
    let guessedTitle = "downloaded_video";
    
    // 1. Title Guessing Engine
    const heading = document.querySelector('h1, h2, [class*="title"], [id*="title"]');
    if (heading) {
        guessedTitle = heading.innerText.trim();
    } else if (document.title) {
        guessedTitle = document.title.split(/[-|•]/)[0].trim();
    }

    // 2. Main File Trigger Mechanism (Direct Download Links)
    function triggerDownload(finalName, sourceUrl) {
        let editedName = prompt("Confirm or edit the video filename:", finalName);
        if (editedName === null) {
            console.log("❌ Download cancelled by user.");
            return;
        }
        
        // Sanitize string matching typical operating system standard file rules
        editedName = editedName.trim().replace(/[^a-z0-9\\s\\-_]/gi, "").replace(/\\s+/g, "_") || "video";

        const downloadLink = document.createElement("a");
        downloadLink.href = sourceUrl;
        downloadLink.download = editedName + ".mp4";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.download = ""; // Reset download trigger rules
        document.body.removeChild(downloadLink);
        console.log("✅ Success! Downloading: " + editedName);
    }

    console.log("🚀 Starting Universal Video Saver...");

    // 3. Document Analysis for Direct Links
    const htmlContent = document.documentElement.outerHTML;
    const highResMatch = htmlContent.match(/html5player\\.setVideoUrlHigh\\(['"]([^'"]+)['"]\\)/);
    const lowResMatch = htmlContent.match(/html5player\\.setVideoUrlLow\\(['"]([^'"]+)['"]\\)/);
    const genericUrlMatch = htmlContent.match(/"videoUrl"\\s*:\\s*['"]([^'"]+)['"]/);

    // Context Quality Branching Logic
    if (highResMatch && lowResMatch) {
        const qualityChoice = prompt("Multiple qualities found!\\n\\nType 1 for High Quality\\nType 2 for Low Quality", "1");
        if (qualityChoice === null) {
            console.log("❌ Download cancelled.");
            return;
        }
        const selectedUrl = (qualityChoice.trim() === "2") ? lowResMatch[1] : highResMatch[1];
        return triggerDownload(guessedTitle, selectedUrl);
    }

    if (highResMatch) return triggerDownload(guessedTitle, highResMatch[1]);
    if (lowResMatch) return triggerDownload(guessedTitle, lowResMatch[1]);
    if (genericUrlMatch && genericUrlMatch[1]) return triggerDownload(guessedTitle, genericUrlMatch[1]);

    // 4. Checking Standard Video DOM Element
    const videoElement = document.querySelector("video");
    if (videoElement && videoElement.src && !videoElement.src.startsWith("blob:")) {
        return triggerDownload(guessedTitle, videoElement.src);
    }

    // 5. Fallback: Local Stream Canvas Buffer Recorder
    if (videoElement) {
        try {
            console.log("🔴 Preparing to capture dynamic stream.");
            console.log("👉 Make sure your video is playing, then complete the prompt setup.");

            let finalStreamName = prompt("Confirm or edit the video filename for the live capture:", guessedTitle);
            if (finalStreamName === null) {
                console.log("❌ Download cancelled.");
                return;
            }
            finalStreamName = finalStreamName.trim().replace(/[^a-z0-9\\s\\-_]/gi, "").replace(/\\s+/g, "_") || "video";

            const getStream = videoElement.captureStream || videoElement.mozCaptureStream;
            if (!getStream) {
                throw new Error("Browser does not support stream capture APIs on video elements.");
            }
            
            const mediaStream = getStream.call(videoElement);
            const recorder = new MediaRecorder(mediaStream, { mimeType: "video/webm" });
            const dataChunks = [];

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) dataChunks.push(event.data);
            };

            recorder.onstop = () => {
                const recordedBlob = new Blob(dataChunks, { type: "video/webm" });
                const blobUrl = URL.createObjectURL(recordedBlob);
                
                const fallbackLink = document.createElement("a");
                fallbackLink.href = blobUrl;
                fallbackLink.download = finalStreamName + ".webm";
                document.body.appendChild(fallbackLink);
                fallbackLink.click();
                document.body.removeChild(fallbackLink);
                URL.revokeObjectURL(blobUrl);
                console.log("✅ Success! Downloaded recorded stream (" + finalStreamName + ".webm).");
            };

            recorder.start();
            console.log("🎬 Recording started! Run 'stopRecording()' in the console when the video ends.");
            
            window.stopRecording = () => {
                if (recorder.state !== "inactive") {
                    recorder.stop();
                    console.log("Stopping stream capture...");
                } else {
                    console.log("⚠️ Recording is already stopped or was never active.");
                }
            };

        } catch (err) {
            console.error("❌ Media stream capture failed or was blocked:", err.message);
        }
    } else {
        console.error("❌ All automated methods failed. No direct stream or <video> targets found on this page.");
    }
})();
