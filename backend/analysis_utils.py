"""
Server-side analysis utilities for ColdIQ
These calculations run without AI to guarantee consistent metrics
"""
import re
from typing import Dict, List, Any, Optional

# Common spam trigger words
SPAM_KEYWORDS = [
    # Urgency/Scarcity
    "act now", "limited time", "urgent", "hurry", "don't miss", "last chance",
    "expires", "deadline", "only today", "immediate",
    # Money/Free
    "free", "no cost", "cash", "money back", "discount", "save big",
    "lowest price", "bargain", "cheap", "affordable",
    # Guarantees
    "guarantee", "guaranteed", "no risk", "risk-free", "100%", "promise",
    # Superlatives
    "best", "amazing", "incredible", "unbelievable", "fantastic",
    # Sales pressure
    "buy now", "order now", "click here", "call now", "subscribe",
    "sign up", "apply now", "get started today",
    # Financial
    "credit", "loan", "investment", "profit", "earn money", "income",
    # Too good to be true
    "winner", "congratulations", "selected", "exclusive deal", "special offer"
]

# CTA types and their friction levels
CTA_PATTERNS = {
    "meeting": {
        "patterns": [r"call\b", r"chat\b", r"meet\b", r"zoom\b", r"demo\b", r"schedule\b", r"\d+\s*min"],
        "friction": "medium"
    },
    "reply": {
        "patterns": [r"reply\b", r"respond\b", r"let me know", r"thoughts\?", r"interested\?"],
        "friction": "low"
    },
    "link": {
        "patterns": [r"click\b", r"check out", r"visit\b", r"see\b.*link", r"http"],
        "friction": "high"
    },
    "question": {
        "patterns": [r"\?$", r"would you", r"could you", r"can you", r"open to"],
        "friction": "low"
    }
}

def calculate_readability(text: str) -> Dict[str, Any]:
    """
    Calculate Flesch Reading Ease score and related metrics
    Score: 0-100 (higher = easier to read)
    """
    if not text or len(text.strip()) == 0:
        return {
            "score": 0,
            "level": "Unknown",
            "sentence_count": 0,
            "word_count": 0,
            "avg_words_per_sentence": 0,
            "avg_syllables_per_word": 0
        }
    
    # Clean text
    text = text.strip()
    
    # Count sentences (rough)
    sentences = re.split(r'[.!?]+', text)
    sentences = [s for s in sentences if s.strip()]
    sentence_count = max(len(sentences), 1)
    
    # Count words
    words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
    word_count = len(words)
    
    if word_count == 0:
        return {
            "score": 0,
            "level": "Unknown",
            "sentence_count": sentence_count,
            "word_count": 0,
            "avg_words_per_sentence": 0,
            "avg_syllables_per_word": 0
        }
    
    # Count syllables (approximation)
    def count_syllables(word):
        word = word.lower()
        if len(word) <= 3:
            return 1
        # Count vowel groups
        syllables = len(re.findall(r'[aeiouy]+', word))
        # Adjust for silent e
        if word.endswith('e'):
            syllables -= 1
        return max(syllables, 1)
    
    total_syllables = sum(count_syllables(w) for w in words)
    
    # Calculate averages
    avg_words_per_sentence = word_count / sentence_count
    avg_syllables_per_word = total_syllables / word_count
    
    # Flesch Reading Ease formula
    # 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
    score = 206.835 - (1.015 * avg_words_per_sentence) - (84.6 * avg_syllables_per_word)
    score = max(0, min(100, score))  # Clamp to 0-100
    
    # Determine level
    if score >= 80:
        level = "Easy"
    elif score >= 60:
        level = "Medium"
    elif score >= 40:
        level = "Moderate"
    else:
        level = "Hard"
    
    return {
        "score": round(score),
        "level": level,
        "sentence_count": sentence_count,
        "word_count": word_count,
        "avg_words_per_sentence": round(avg_words_per_sentence, 1),
        "avg_syllables_per_word": round(avg_syllables_per_word, 2)
    }

def detect_spam_keywords(text: str) -> Dict[str, Any]:
    """
    Detect spam trigger words in text
    Returns list of found keywords and risk score
    """
    if not text:
        return {"keywords": [], "risk_score": 0}
    
    text_lower = text.lower()
    found_keywords = []
    
    for keyword in SPAM_KEYWORDS:
        if keyword in text_lower:
            found_keywords.append(keyword)
    
    # Calculate risk score (0-100)
    # Each keyword adds to risk, with diminishing returns
    if len(found_keywords) == 0:
        risk_score = 0
    elif len(found_keywords) == 1:
        risk_score = 15
    elif len(found_keywords) == 2:
        risk_score = 30
    elif len(found_keywords) <= 4:
        risk_score = 50
    elif len(found_keywords) <= 6:
        risk_score = 70
    else:
        risk_score = 85
    
    return {
        "keywords": found_keywords[:10],  # Limit to top 10
        "risk_score": risk_score
    }

def analyze_subject_line(subject: str) -> Dict[str, Any]:
    """
    Analyze subject line for effectiveness
    """
    if not subject:
        return {
            "length": 0,
            "has_personalization": False,
            "has_urgency": False,
            "has_curiosity": False,
            "has_numbers": False,
            "effectiveness": 3
        }
    
    length = len(subject)
    subject_lower = subject.lower()
    
    # Check for personalization (merge tags or names)
    has_personalization = bool(re.search(r'\{\{.*?\}\}|\[\[.*?\]\]|{{.*?}}', subject))
    
    # Check for urgency words
    urgency_words = ["urgent", "asap", "now", "today", "quick", "fast", "deadline", "limited"]
    has_urgency = any(word in subject_lower for word in urgency_words)
    
    # Check for curiosity triggers
    curiosity_patterns = [r"\?", r"how", r"why", r"what if", r"secret", r"discover", r"reveal"]
    has_curiosity = any(re.search(p, subject_lower) for p in curiosity_patterns)
    
    # Check for numbers
    has_numbers = bool(re.search(r'\d+', subject))
    
    # Calculate effectiveness (1-10)
    effectiveness = 5  # Base score
    
    # Length scoring (optimal: 30-50 chars)
    if 30 <= length <= 50:
        effectiveness += 1
    elif length < 20 or length > 70:
        effectiveness -= 1
    
    # Personalization bonus
    if has_personalization:
        effectiveness += 2
    
    # Curiosity bonus
    if has_curiosity:
        effectiveness += 1
    
    # Numbers bonus (specificity)
    if has_numbers:
        effectiveness += 1
    
    # Urgency can be positive or negative
    if has_urgency:
        effectiveness -= 1  # Often feels salesy
    
    effectiveness = max(1, min(10, effectiveness))
    
    return {
        "length": length,
        "has_personalization": has_personalization,
        "has_urgency": has_urgency,
        "has_curiosity": has_curiosity,
        "has_numbers": has_numbers,
        "effectiveness": effectiveness
    }

def analyze_cta(body: str) -> Dict[str, Any]:
    """
    Analyze call-to-action in email body
    """
    if not body:
        return {
            "cta_present": False,
            "cta_clarity": 0,
            "cta_type": None,
            "cta_placement": None,
            "friction_level": None
        }
    
    body_lower = body.lower()
    lines = body.strip().split('\n')
    
    # Find CTA type and location
    cta_type = None
    cta_line_index = -1
    
    for line_idx, line in enumerate(lines):
        line_lower = line.lower()
        for ctype, config in CTA_PATTERNS.items():
            for pattern in config["patterns"]:
                if re.search(pattern, line_lower):
                    cta_type = ctype
                    cta_line_index = line_idx
                    break
            if cta_type:
                break
        if cta_type:
            break
    
    if not cta_type:
        # Check for question mark at end (implicit CTA)
        if body.strip().endswith('?'):
            cta_type = "question"
            cta_line_index = len(lines) - 1
    
    if not cta_type:
        return {
            "cta_present": False,
            "cta_clarity": 2,
            "cta_type": None,
            "cta_placement": None,
            "friction_level": "high"
        }
    
    # Determine placement
    total_lines = len(lines)
    if cta_line_index < total_lines * 0.33:
        placement = "beginning"
    elif cta_line_index < total_lines * 0.66:
        placement = "middle"
    else:
        placement = "end"
    
    # Get friction level
    friction = CTA_PATTERNS.get(cta_type, {}).get("friction", "medium")
    
    # Calculate clarity (1-10)
    clarity = 5
    
    # Placement bonus (end is best for cold emails)
    if placement == "end":
        clarity += 2
    elif placement == "middle":
        clarity += 1
    
    # Type bonuses
    if cta_type == "reply":
        clarity += 2  # Easiest action
    elif cta_type == "question":
        clarity += 1
    elif cta_type == "link":
        clarity -= 1  # Requires more trust
    
    # Friction penalty
    if friction == "high":
        clarity -= 1
    elif friction == "low":
        clarity += 1
    
    clarity = max(1, min(10, clarity))
    
    return {
        "cta_present": True,
        "cta_clarity": clarity,
        "cta_type": cta_type,
        "cta_placement": placement,
        "friction_level": friction
    }

def calculate_inbox_placement_score(spam_risk: int, readability_score: int, word_count: int) -> int:
    """
    Estimate inbox placement likelihood based on various factors
    """
    score = 80  # Start with good baseline
    
    # Spam risk impact
    if spam_risk > 50:
        score -= 30
    elif spam_risk > 30:
        score -= 15
    elif spam_risk > 10:
        score -= 5
    
    # Readability impact
    if readability_score < 40:
        score -= 10
    elif readability_score >= 70:
        score += 5
    
    # Length impact (too short or too long is bad)
    if word_count < 30:
        score -= 10  # Too short looks spammy
    elif word_count > 300:
        score -= 15  # Too long gets filtered
    elif 50 <= word_count <= 150:
        score += 5  # Optimal range
    
    return max(0, min(100, score))

def generate_fix_suggestions(
    subject: str,
    body: str,
    spam_result: Dict,
    readability_result: Dict,
    subject_analysis: Dict,
    cta_analysis: Dict
) -> List[Dict[str, str]]:
    """
    Generate rule-based "Fix This" suggestions (non-AI)
    Returns actionable improvements with priority
    """
    suggestions = []
    
    # Subject line suggestions
    if subject_analysis["length"] < 20:
        suggestions.append({
            "type": "subject",
            "priority": "high",
            "issue": "Subject line too short",
            "fix": "Add more context. Aim for 30-50 characters to improve open rates."
        })
    elif subject_analysis["length"] > 60:
        suggestions.append({
            "type": "subject",
            "priority": "medium",
            "issue": "Subject line too long",
            "fix": "Shorten to under 50 characters. Mobile shows ~30-40 chars."
        })
    
    if not subject_analysis["has_personalization"]:
        suggestions.append({
            "type": "subject",
            "priority": "high",
            "issue": "No personalization in subject",
            "fix": "Add {{first_name}} or reference their company. Personalized subjects get 26% more opens."
        })
    
    if subject_analysis["has_urgency"]:
        suggestions.append({
            "type": "subject",
            "priority": "medium",
            "issue": "Urgency language detected",
            "fix": "Remove words like 'urgent' or 'ASAP'. They often trigger spam filters and feel pushy."
        })
    
    # Spam suggestions
    if spam_result["risk_score"] > 30:
        keyword_list = ", ".join(spam_result["keywords"][:3])
        suggestions.append({
            "type": "spam",
            "priority": "high",
            "issue": f"Spam trigger words found: {keyword_list}",
            "fix": "Replace these words with more natural alternatives to avoid spam folders."
        })
    
    # Readability suggestions
    if readability_result["score"] < 50:
        suggestions.append({
            "type": "readability",
            "priority": "medium",
            "issue": "Email is hard to read",
            "fix": f"Simplify your language. Current avg: {readability_result['avg_words_per_sentence']} words/sentence. Aim for 15 or less."
        })
    
    if readability_result["word_count"] > 150:
        suggestions.append({
            "type": "length",
            "priority": "high",
            "issue": f"Email too long ({readability_result['word_count']} words)",
            "fix": "Cut to 50-100 words. Shorter cold emails get 2x more replies."
        })
    elif readability_result["word_count"] < 30:
        suggestions.append({
            "type": "length",
            "priority": "medium",
            "issue": "Email too short",
            "fix": "Add more context or value proposition. Aim for at least 50 words."
        })
    
    # CTA suggestions
    if not cta_analysis["cta_present"]:
        suggestions.append({
            "type": "cta",
            "priority": "high",
            "issue": "No clear call-to-action",
            "fix": "Add a specific ask like 'Would you be open to a quick call?' or 'Reply with your thoughts?'"
        })
    elif cta_analysis["cta_clarity"] < 5:
        suggestions.append({
            "type": "cta",
            "priority": "medium",
            "issue": "Weak call-to-action",
            "fix": "Make your CTA clearer. Ask for one specific thing with low friction."
        })
    
    if cta_analysis["cta_placement"] == "beginning":
        suggestions.append({
            "type": "cta",
            "priority": "low",
            "issue": "CTA too early in email",
            "fix": "Move your ask to the end. Build context first, then make the request."
        })
    
    if cta_analysis["friction_level"] == "high":
        suggestions.append({
            "type": "cta",
            "priority": "medium",
            "issue": "High-friction CTA",
            "fix": "Lower the ask. Instead of links or demos, try 'Would you be interested?' first."
        })
    
    # Sort by priority
    priority_order = {"high": 0, "medium": 1, "low": 2}
    suggestions.sort(key=lambda x: priority_order.get(x["priority"], 1))
    
    return suggestions[:6]  # Return top 6 suggestions

def run_server_side_analysis(subject: str, body: str) -> Dict[str, Any]:
    """
    Run all server-side analysis calculations
    Returns a complete analysis result that doesn't depend on AI
    """
    # Combine subject and body for some analyses
    full_text = f"{subject}\n{body}"
    
    # Run individual analyses
    readability = calculate_readability(body)
    spam = detect_spam_keywords(full_text)
    subject_analysis = analyze_subject_line(subject)
    cta = analyze_cta(body)
    inbox_score = calculate_inbox_placement_score(
        spam["risk_score"], 
        readability["score"],
        readability["word_count"]
    )
    
    # Generate fix suggestions
    fix_suggestions = generate_fix_suggestions(
        subject, body, spam, readability, subject_analysis, cta
    )
    
    return {
        "readability_score": readability["score"],
        "readability_level": readability["level"],
        "sentence_count": readability["sentence_count"],
        "avg_words_per_sentence": readability["avg_words_per_sentence"],
        "spam_keywords": spam["keywords"],
        "spam_risk_score": spam["risk_score"],
        "subject_line_analysis": subject_analysis,
        "cta_analysis": cta,
        "inbox_placement_score": inbox_score,
        "fix_suggestions": fix_suggestions
    }
