# AnyVideoDownloader

A lightweight, client-side JavaScript utility designed to extract, name, and download HTML5 videos directly from your browser. This project functions as a browser bookmarklet that automates video source detection, offers quality selection where available, allows customizable filename formatting, and features a fallback canvas/stream recorder for dynamic content.

---

## Key Features

- **Automated Source Detection:** Scans the page DOM and source code to identify structural high/low quality parameters (`html5player.setVideoUrlHigh/Low`) or raw `<video>` element paths.
- **Smart Title Guessing:** Queries headers (`<h1>`, `<h2>`) and document tab metadata to pre-fill an appropriate asset name.
- **Interactive Prompts:**
  - **Quality Choice:** Prompts the user to pick between multiple resolutions if the page structure exposes discrete alternative variants.
  - **Custom Filename:** Pre-fills the guessed title into an editable text box before execution, sanitizing special characters automatically.
- **Dynamic Stream Capture Fallback:** If direct URLs are obfuscated or restricted via Media Source Extensions (MSE/Blobs), the tool initiates a local client-side `MediaRecorder` session tracking the active video stream layout.

---

## Installation & Setup

### 1. As a Bookmarklet (Recommended)
To run the script natively across different browser sessions without keeping the developer console open:

1. Reveal your browser's Bookmarks Bar (`Ctrl + Shift + B` or `Cmd + Shift + B`).
2. Right-click the bar and select **Add Page** or **New Bookmark**.
3. Set the **Name** to something descriptive (e.g., `🚀 Video Saver`).
4. Copy the compressed, URL-encoded block below and paste it directly into the **URL** or **Location** field:

```javascript
javascript:(function(){let%20t="downloaded_video";const%20e=document.querySelector('h1,h2,[class*="title"],[id*="title"]');if(e)t=e.innerText.trim();else%20if(document.title)t=document.title.split(/[-|•]/)[0].trim();function%20o(t,e){let%20o=prompt("Confirm%20or%20edit%20the%20video%20filename:",t);if(null===o)return%20void%20console.log("❌%20Download%20cancelled%20by%20user.");o=o.trim().replace(/[^a-z0-9\s\-_]/gi,"").replace(/\s+/g,"_")||"video";const%20n=document.createElement("a");n.href=e,n.download=o+".mp4",document.body.appendChild(n),n.click(),document.body.removeChild(n),console.log("✅%20Success!%20Downloading:%20"+o)}console.log("🚀%20Starting%20Universal%20Video%20Saver...");const%20n=document.documentElement.outerHTML,c=n.match(/html5player\.setVideoUrlHigh\(['"]([^'"]+)['"]\)/),a=n.match(/html5player\.setVideoUrlLow\(['"]([^'"]+)['"]\)/),r=n.match(/"videoUrl"\s*:\s*['"]([^'"]+)['"]/);if(c&&a){const%20l=prompt("Multiple%20qualities%20found!\n\nType%201%20for%20High%20Quality\nType%202%20for%20Low%20Quality","1");if(null===l)return%20void%20console.log("❌%20Download%20cancelled.");return%20void%20o(t,"2"===l.trim()?a[1]:c[1])}if(c)return%20void%20o(t,c[1]);if(a)return%20void%20o(t,a[1]);if(r&&r[1])return%20void%20o(t,r[1]);const%20i=document.querySelector("video");if(i&&i.src&&!i.src.startsWith("blob:"))return%20void%20o(t,i.src);if(i)try{let%20d=prompt("Confirm%20or%20edit%20the%20video%20filename:",t);if(null===d)return%20void%20console.log("❌%20Download%20cancelled.");d=d.trim().replace(/[^a-z0-9\s\-_]/gi,"").replace(/\s+/g,"_")||"video";const%20s=i.captureStream?i.captureStream():i.mozCaptureStream(),m=new%20MediaRecorder(s,{mimeType:"video/webm"}),u=[];m.ondataavailable=(t=>{t.data.size>0&&u.push(t.data)}),m.onstop=(()=>{const%20t=new%20Blob(u,{type:"video/webm"}),e=URL.createObjectURL(t);const%20o=document.createElement("a");o.href=e,o.download=d+".webm",document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(e),console.log("✅%20Success!%20Downloaded%20stream.")}),m.start(),console.log("🔴%20Capturing%20dynamic%20stream.%20Please%20hit%20play%20on%20the%20video."),console.log("👉%20Execute%20'stopRecording()'%20in%20the%20console%20to%20save."),window.stopRecording=(()=>m.stop())}catch(t){console.error("❌%20Media%20stream%20capture%20was%20blocked.",t)}else%20console.error("❌%20All%20automated%20methods%20failed.")})();
