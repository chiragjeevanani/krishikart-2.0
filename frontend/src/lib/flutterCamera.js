export const openFlutterCamera = async () => {
    if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
        try {
            const result = await window.flutter_inappwebview.callHandler('openCamera');
            if (result && result.success) {
                const byteString = atob(result.base64);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: result.mimeType || 'image/jpeg' });
                return new File([blob], result.fileName || 'camera_upload.jpg', { type: result.mimeType || 'image/jpeg' });
            }
        } catch (err) {
            console.error("Flutter camera handler failed:", err);
            return null;
        }
    }
    return null;
};
