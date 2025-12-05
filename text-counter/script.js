const textInput = document.getElementById('text-input');
const wordCount = document.getElementById('word-count');
const charCount = document.getElementById('char-count');
const sentenceCount = document.getElementById('sentence-count');
const readingTime = document.getElementById('reading-time');

function updateCounts() {
    const text = textInput.value;
    
    // Character count
    const characters = text.length;
    charCount.textContent = characters;
    
    // Word count
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    wordCount.textContent = text.trim().length === 0 ? 0 : words;
    
    // Sentence count
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    sentenceCount.textContent = sentences;
    
    // Reading time (average reading speed: 200 words per minute)
    const minutes = Math.ceil(words / 200);
    readingTime.textContent = words === 0 ? 0 : minutes;
}

// Update counts on input
textInput.addEventListener('input', updateCounts);

// Initialize counts on page load
updateCounts();
