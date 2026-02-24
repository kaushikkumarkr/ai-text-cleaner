document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const btnClean = document.getElementById('btn-clean');
    const btnSpacing = document.getElementById('btn-spacing');
    const btnSentence = document.getElementById('btn-sentence');
    const btnCopy = document.getElementById('btn-copy');
    const copyTextSpan = document.getElementById('copy-text');
    
    const statWords = document.getElementById('stat-words');
    const statChars = document.getElementById('stat-chars');
    const statReading = document.getElementById('stat-reading');

    const WORDS_PER_MINUTE = 200;

    // --- Core Functionality ---

    // Update real-time stats
    const updateStats = () => {
        const text = textInput.value;
        
        // Character count
        const charCount = text.length;
        statChars.textContent = charCount.toLocaleString();

        // Word count (split by spaces/newlines, filter out empty strings)
        const wordArr = text.trim() ? text.trim().split(/\s+/) : [];
        const wordCount = wordArr.length;
        statWords.textContent = wordCount.toLocaleString();

        // Reading time
        const timeMinutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
        statReading.textContent = wordCount === 0 ? '0 min' : `${timeMinutes} min`;
    };

    // Clean AI Formatting
    const cleanAIText = () => {
        let text = textInput.value;
        
        // Remove markdown symbols: ** bold, * italic, ### headings, > quotes, ` code
        // and <br> or <br/> tags
        
        // Remove bold/italics
        text = text.replace(/(?:\*\*|__)(.*?)(?:\*\*|__)/g, '$1'); 
        text = text.replace(/(?:\*|_)(.*?)(?:\*|_)/g, '$1'); 
        
        // Remove headings (e.g. ### Heading)
        text = text.replace(/^#{1,6}\s+/gm, '');
        
        // Remove blockquotes (e.g. > Quote)
        text = text.replace(/^>\s+/gm, '');

        // Remove inline code ticks
        text = text.replace(/`(.*?)`/g, '$1');

        // Remove <br> tags (HTML breaks)
        text = text.replace(/<br\s*\/?>/gi, '\n');
        
        // NOTE: Textarea natively strips rich text HTML (like gray backgrounds) when pasted 
        // as plain text. The user is just dealing with string contents here.

        textInput.value = text;
        updateStats();
        triggerPopAnimation(btnClean);
    };

    // Fix Spacing
    const fixSpacing = () => {
        let text = textInput.value;
        
        // Replace multiple spaces with a single space
        text = text.replace(/[ \t]{2,}/g, ' ');

        // Remove trailing whitespaces at end of lines
        text = text.replace(/[ \t]+$/gm, '');

        // Remove more than 2 consecutive newlines, condensing them to 2
        text = text.replace(/\n{3,}/g, '\n\n');

        // Trim start and end of document
        text = text.trim();

        textInput.value = text;
        updateStats();
        triggerPopAnimation(btnSpacing);
    };

    // Sentence Case
    const toSentenceCase = () => {
        let text = textInput.value;
        
        // Make everything lowercase first (optional: maybe just lowercasing the rest of the sentence, 
        // but typically sentence case means First letter cap, rest lower, preserving I, proper nouns if possible.
        // Doing full lowercase loses proper nouns. Instead we just ensure the first letter of sentences is capitalized
        // AND convert the rest of the text to lowercase inside the sentence? 
        // The safest approach that doesn't ruin proper nouns is just capitalizing the first letter of sentences,
        // and leaving the rest as they are, OR standardizing it entirely. 
        // Let's do: lowercase everything, then capitalize first letter of sentences.
        
        text = text.toLowerCase();
        
        // Capitalize first letter of every sentence (after ., !, ?)
        text = text.replace(/(^\s*|[.!?]\s+|\n\s*)([a-z])/g, (match, separator, letter) => {
            return separator + letter.toUpperCase();
        });

        // Capitalize standalone " i " and " i'm " etc (common fix after lowercasing)
        text = text.replace(/\b(i)\b/g, "I");
        text = text.replace(/\b(i'm)\b/g, "I'm");
        text = text.replace(/\b(i've)\b/g, "I've");
        text = text.replace(/\b(i'll)\b/g, "I'll");

        textInput.value = text;
        updateStats();
        triggerPopAnimation(btnSentence);
    };

    // Copy to Clipboard
    const copyText = async () => {
        if (!textInput.value) return;

        try {
            await navigator.clipboard.writeText(textInput.value);
            
            // Temporary success state
            btnCopy.classList.add('success');
            copyTextSpan.textContent = 'Copied!';
            triggerPopAnimation(btnCopy);

            setTimeout(() => {
                btnCopy.classList.remove('success');
                copyTextSpan.textContent = 'Copy to Clipboard';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Clipboard copy failed. Please copy manually.');
        }
    };

    // Helper: Add button pop animation
    const triggerPopAnimation = (btn) => {
        btn.classList.remove('animate-pop');
        // prompt reflow
        void btn.offsetWidth;
        btn.classList.add('animate-pop');
    };

    // --- Event Listeners ---
    textInput.addEventListener('input', updateStats);
    btnClean.addEventListener('click', cleanAIText);
    btnSpacing.addEventListener('click', fixSpacing);
    btnSentence.addEventListener('click', toSentenceCase);
    btnCopy.addEventListener('click', copyText);

    // Initial stat calculation
    updateStats();
});
