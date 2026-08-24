/**
 * =========================================================
 * EDITORIAL BRUTALIST CONTACT & FOOTER SECTION JAVASCRIPT
 * =========================================================
 * 
 * QUICK CUSTOMIZATION CONFIG:
 * Change your target email, pre-filled messages, and social URLs below.
 */

const CONFIG = {
    // 1. Target Email for "CONTACT ME" action
    contactEmail: "sudip.das.ghosh@example.com",

    // 2. Pre-filled Message details
    emailSubject: "Project Collaboration Inquiry",
    emailBody: "Hi Sudip,\n\nI would like to discuss a project collaboration.\n\nBest regards,\n[Your Name]",

    // 3. Social Media Links
    socialLinks: {
        twitter: "https://x.com",
        facebook: "https://facebook.com",
        linkedin: "https://linkedin.com",
        instagram: "https://instagram.com"
    },

    // 4. Newsletter Simulated API delay (ms)
    newsletterDelayMs: 600
};

// Initialize when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    setupContactButtons();
    setupNewsletterForm();
    setupContactModal();
    setupNavigation();
});

/**
 * 1. Setup "CONTACT ME" button action
 */
function setupContactButtons() {
    const contactMeBtn = document.getElementById("contact-me-btn");
    if (!contactMeBtn) return;

    // Build the prefilled mailto URL dynamically from CONFIG
    const mailtoUrl = `mailto:${encodeURIComponent(CONFIG.contactEmail)}?subject=${encodeURIComponent(CONFIG.emailSubject)}&body=${encodeURIComponent(CONFIG.emailBody)}`;
    contactMeBtn.setAttribute("href", mailtoUrl);

    // When clicked, open the interactive modal for convenience, or trigger mailto
    contactMeBtn.addEventListener("click", (e) => {
        // Optionally open the rich modal if user prefers on-screen message composer
        const modal = document.getElementById("contact-modal");
        if (modal) {
            e.preventDefault();
            openModal();
        }
    });
}

/**
 * 2. Setup Newsletter Subscription Form
 */
function setupNewsletterForm() {
    const form = document.getElementById("newsletter-form");
    const emailInput = document.getElementById("newsletter-email");
    const feedbackEl = document.getElementById("newsletter-feedback");
    const submitBtn = form?.querySelector(".newsletter-submit-btn");

    if (!form || !emailInput || !feedbackEl) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();

        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            showFeedback("Please enter your email address.", "error");
            emailInput.focus();
            return;
        }

        if (!emailRegex.test(email)) {
            showFeedback("Please enter a valid email address.", "error");
            emailInput.focus();
            return;
        }

        // Submit state animation
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        }

        showFeedback("Subscribing...", "neutral");

        // Simulate server call
        setTimeout(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
            }

            showFeedback("✓ Subscribed successfully! Thank you for joining.", "success");
            showToast(`Welcome! Newsletter confirmation sent to ${email}`);
            form.reset();

            // Clear feedback after 4 seconds
            setTimeout(() => {
                if (feedbackEl) feedbackEl.textContent = "";
            }, 4000);
        }, CONFIG.newsletterDelayMs);
    });

    function showFeedback(message, type) {
        feedbackEl.textContent = message;
        feedbackEl.className = "newsletter-feedback " + (type || "");
    }
}

/**
 * 3. Setup Interactive Contact Modal
 */
function setupContactModal() {
    const modal = document.getElementById("contact-modal");
    const closeBtn = document.getElementById("modal-close-btn");
    const backdrop = document.getElementById("modal-backdrop");
    const modalForm = document.getElementById("contact-modal-form");
    const nativeMailtoBtn = document.getElementById("modal-native-mailto");

    if (!modal) return;

    // Update native mailto link
    if (nativeMailtoBtn) {
        nativeMailtoBtn.href = `mailto:${encodeURIComponent(CONFIG.contactEmail)}?subject=${encodeURIComponent(CONFIG.emailSubject)}&body=${encodeURIComponent(CONFIG.emailBody)}`;
    }

    closeBtn?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", closeModal);

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            closeModal();
        }
    });

    // Modal Form submission
    modalForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("client-name")?.value || "Friend";
        const email = document.getElementById("client-email")?.value;
        const message = document.getElementById("client-message")?.value;

        const mailtoLink = `mailto:${encodeURIComponent(CONFIG.contactEmail)}?subject=${encodeURIComponent("New Inquiry from " + name)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message)}`;

        // Open user's email client
        window.location.href = mailtoLink;

        closeModal();
        showToast(`Opening email client to send message to ${CONFIG.contactEmail}...`);
        modalForm.reset();
    });
}

function openModal() {
    const modal = document.getElementById("contact-modal");
    if (modal) {
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden"; // Prevent background scroll
        document.getElementById("client-name")?.focus();
    }
}

function closeModal() {
    const modal = document.getElementById("contact-modal");
    if (modal) {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}

/**
 * 4. Setup Smooth Navigation
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link:not(.highlight-contact-btn)');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                } else {
                    showToast(`Navigating to ${link.textContent.trim()} section`);
                }
            }
        });
    });
}

/**
 * 5. Toast Notification Helper
 */
function showToast(message) {
    let toast = document.getElementById("toast-notification");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-notification";
        toast.className = "toast-notification";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}
