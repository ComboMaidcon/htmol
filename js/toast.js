// ===== TOAST =====
export function showToast(message, duration = 3000) {
    return new Promise((resolve) => {
        let container = document.getElementById("toast-container");
        
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = "toast show"; 
        toast.innerText = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(40px)";

            setTimeout(() => {
                toast.remove();
                resolve();
            }, 1000);
        }, duration);
    });
}