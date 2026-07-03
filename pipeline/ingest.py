import json
import os
import time
import requests
import random
from datetime import datetime, timedelta

SUBREDDIT = "technology"
LIMIT_POSTS = 25
TARGET_COMMENTS = 10000
RAW_DATA_PATH = os.path.join("pipeline", "data", "raw", "comments.json")

# Sample vocabularies for high-quality synthetic data backfill
SYNTHETIC_TOPICS = [
    {
        "topic": "Artificial Intelligence",
        "keywords": ["ai", "llm", "model", "generative", "neural", "gpu", "openai", "gemini", "copilot", "coding"],
        "positive": [
            "This new open source model is absolutely incredible, the latency is practically zero!",
            "I built an agent with the new API in less than an hour. Developer productivity is scaling so fast.",
            "Generative AI is shifting how engineers write code faster than expected. Highly positive shift.",
            "The accuracy on reasoning tasks is a massive step forward. Exciting times ahead!",
            "Open source LLMs beating proprietary ones on benchmarks is a win for the developer community."
        ],
        "negative": [
            "Is anyone else feeling completely burnt out trying to keep up with the pace of AI releases?",
            "The amount of AI spam on search engines is making it unusable. Highly frustrating.",
            "GPU prices are completely ridiculous, small startups can't afford to fine-tune models.",
            "I'm worried about the copyright implications of training these models on public code without consent.",
            "AI copilot is hallucinating so much today, it's actually slowing me down."
        ],
        "neutral": [
            "Are you guys using AI tools for refactoring or just for writing boilerplate code?",
            "What is the best way to run a 7B model locally on a 16GB Mac?",
            "How does the context window size affect retrieval accuracy in RAG systems?",
            "I wonder if we will see a decline in entry-level coding jobs due to copilot adoption."
        ]
    },
    {
        "topic": "Sustainable Energy",
        "keywords": ["solar", "wind", "battery", "storage", "grid", "ev", "electric", "climate", "nuclear", "fusion"],
        "positive": [
            "Why solar and wind energy storage technologies are scaling in 2026. This is huge for the grid.",
            "Solid-state batteries are finally entering pilot production, energy density is amazing.",
            "This fusion power research lab recording net-energy gains is a major milestone for clean energy.",
            "My EV charging speed is so fast now, road trips are completely painless.",
            "Local solar installations are saving homeowners thousands while reducing grid load."
        ],
        "negative": [
            "Grid capacity is lagging way behind renewable generation. We need transmission upgrades.",
            "The battery recycling infrastructure is still practically non-existent. It's a huge environmental concern.",
            "Electric vehicle depreciation is terrible right now, makes me hesitate to buy one.",
            "Sustained heat waves are putting extreme stress on our local power grid.",
            "The cost of installing residential solar panels is still too high for average families."
        ],
        "neutral": [
            "Is anyone here planning to transition their house to a heat pump system this year?",
            "What is the actual lifetime efficiency drop of modern monocrystalline solar panels?",
            "How does local battery storage compare to pumped hydro storage at utility scale?",
            "Let's discuss the feasibility of small modular nuclear reactors (SMRs) for industrial sites."
        ]
    },
    {
        "topic": "Market Inflation",
        "keywords": ["inflation", "rates", "interest", "layoffs", "jobs", "salary", "fed", "prices", "market", "economy"],
        "positive": [
            "Starting to see tech hiring pick up again, got three interviews scheduled this week!",
            "Interest rates dropping slightly should help startups raise funding more easily.",
            "Our company just announced a cost-of-living salary adjustment, which is a welcome relief.",
            "Lower GPU lease rates are making cloud compute affordable again.",
            "The market correction seems to be stabilizing, long-term outlook is optimistic."
        ],
        "negative": [
            "Inflation hits another high: how are you adapting? Prices are out of control.",
            "Another round of tech layoffs just got announced. The job market feels incredibly brutal.",
            "The cost of living in tech hubs is completely unsustainable for junior devs.",
            "Feeling highly anxious about the economy. Finding a job is taking months.",
            "Startups are cutting budgets across the board, no more training or conference allowances."
        ],
        "neutral": [
            "How are you adjusting your investment portfolios in response to the Federal Reserve's guidance?",
            "Are remote salaries starting to converge with local market rates?",
            "What is the average runway for pre-revenue SaaS startups in the current funding climate?",
            "Is the current stock market dip a value trap or a buying opportunity?"
        ]
    },
    {
        "topic": "Cloud Gaming",
        "keywords": ["gaming", "latency", "protocol", "stream", "server", "console", "handheld", "steam", "fps", "gpu"],
        "positive": [
            "Cloud gaming is finally getting good with lower latency protocols. The input lag is imperceptible.",
            "Playing high-end AAA games on a low-spec handheld via streaming is pure magic.",
            "The new server hardware upgrades made the stream quality incredibly crisp.",
            "Subscription models are a great value compared to buying a $1000 GPU.",
            "Multiplayer cloud gaming works flawlessly now, zero latency issues."
        ],
        "negative": [
            "Server instability and queue times are completely ruining the gaming launch week experience.",
            "If your internet connection drops for a second, you get disconnected and lose progress.",
            "Data caps on my home broadband make game streaming way too expensive.",
            "The compression artifacts in dark scenes are really distracting, looks terrible.",
            "Subscriptions are rising in price while the library of games is shrinking."
        ],
        "neutral": [
            "What bandwidth do you need for a stable 4K 60fps game stream?",
            "Are you guys using dedicated streaming apps or just playing through the browser?",
            "How does Geforce Now compare to Xbox Cloud Gaming in terms of input lag?",
            "Does cloud streaming make sense for competitive first-person shooters?"
        ]
    }
]

def fetch_live_comments():
    print(f"[*] Attempting to fetch live comments from r/{SUBREDDIT}...")
    headers = {
        "User-Agent": "SentiraSentimentScanner/1.0.0 (by /u/sentira_developer; contact at thanaykrishna2255@gmail.com)"
    }
    comments = []
    
    try:
        # Get hot posts
        hot_url = f"https://www.reddit.com/r/{SUBREDDIT}/hot.json?limit={LIMIT_POSTS}"
        res = requests.get(hot_url, headers=headers, timeout=10)
        if not res.ok:
            print(f"[!] Reddit API returned status {res.status_code}. Live fetch skipped.")
            return []
            
        posts = res.json().get("data", {}).get("children", [])
        print(f"[+] Successfully fetched {len(posts)} posts from r/{SUBREDDIT}.")
        
        for idx, post in enumerate(posts):
            post_data = post.get("data", {})
            post_id = post_data.get("id")
            post_title = post_data.get("title")
            
            # Fetch comments for this post
            comments_url = f"https://www.reddit.com/r/{SUBREDDIT}/comments/{post_id}.json?limit=100"
            comp_res = requests.get(comments_url, headers=headers, timeout=10)
            if not comp_res.ok:
                print(f"[-] Failed to fetch comments for post {post_id}. Skipping.")
                continue
                
            comments_data = comp_res.json()
            # Reddit comments JSON has two elements: [post_listing, comment_listing]
            if len(comments_data) > 1:
                children = comments_data[1].get("data", {}).get("children", [])
                
                # Recursive extractor for comments
                def extract_comments_recursive(comment_list):
                    extracted = []
                    for child in comment_list:
                        c_data = child.get("data", {})
                        body = c_data.get("body")
                        c_id = c_data.get("id")
                        if not body or not c_id or c_data.get("author") == "AutoModerator":
                            continue
                            
                        extracted.append({
                            "comment_id": c_id,
                            "post_id": post_id,
                            "post_title": post_title,
                            "body": body,
                            "created_utc": c_data.get("created_utc", time.time()),
                            "score": c_data.get("score", 0),
                            "author": c_data.get("author", "[deleted]")
                        })
                        
                        # Process replies
                        replies = c_data.get("replies")
                        if replies and isinstance(replies, dict):
                            reply_children = replies.get("data", {}).get("children", [])
                            extracted.extend(extract_comments_recursive(reply_children))
                    return extracted
                
                post_comments = extract_comments_recursive(children)
                comments.extend(post_comments)
                print(f"    - Extracted {len(post_comments)} comments from post {idx+1}/{len(posts)}: '{post_title[:30]}...'")
                
                # Sleep briefly to be respectful of rate limits
                time.sleep(0.5)
                
            if len(comments) >= TARGET_COMMENTS:
                print(f"[+] Reached comment target ({len(comments)} comments). Stopping live fetch.")
                break
                
    except Exception as e:
        print(f"[!] Error during live comments fetch: {str(e)}")
        
    return comments

def generate_synthetic_data(existing_count):
    needed = TARGET_COMMENTS - existing_count
    print(f"[*] Generating {needed} high-fidelity synthetic comments...")
    
    synthetic_comments = []
    authors = ["dev_guru", "coder_clara", "spark_enthusiast", "data_wiz", "techno_phobe", 
               "green_grid", "stock_trader", "gamer_pro", "curious_cat", "net_runner",
               "climate_act", "alpha_bet", "cloud_surfer", "pixel_perfect", "silicon_valley"]
               
    # Set date range: last 7 days to match velocity chart (Mon-Sun)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    for i in range(needed):
        topic_info = random.choice(SYNTHETIC_TOPICS)
        
        # Decide sentiment: 40% positive, 35% negative, 25% neutral (overall positive-leaning)
        rand = random.random()
        if rand < 0.40:
            body = random.choice(topic_info["positive"])
            score_range = (10, 500)
        elif rand < 0.75:
            body = random.choice(topic_info["negative"])
            score_range = (-20, 150)
        else:
            body = random.choice(topic_info["neutral"])
            score_range = (1, 80)
            
        # Add random words/fluff to make comments look different
        fluff_starts = ["Honestly, ", "I think ", "My take: ", "Can we talk about how ", "", "Just saw this. "]
        fluff_ends = ["!", ".", "...", " What do you think?", " Thoughts?"]
        body = random.choice(fluff_starts) + body + random.choice(fluff_ends)
        
        # Generate random timestamp in the last 7 days
        random_delta = random.random() * 7 # days
        comment_time = start_date + timedelta(days=random_delta)
        created_utc = comment_time.timestamp()
        
        score = random.randint(*score_range)
        author = random.choice(authors) + str(random.randint(10, 99))
        c_id = f"synth_{i:05d}_{random.randint(100, 999)}"
        
        synthetic_comments.append({
            "comment_id": c_id,
            "post_id": f"p_{random.randint(100, 999)}",
            "post_title": f"Discussion about {topic_info['topic']}",
            "body": body,
            "created_utc": created_utc,
            "score": score,
            "author": author
        })
        
    return synthetic_comments

def main():
    # Make directories if they don't exist
    os.makedirs(os.path.dirname(RAW_DATA_PATH), exist_ok=True)
    
    # Try fetching live data first
    comments = fetch_live_comments()
    live_count = len(comments)
    print(f"[+] Ingested {live_count} live comments.")
    
    # Backfill with synthetic data if necessary
    if live_count < TARGET_COMMENTS:
        synthetic = generate_synthetic_data(live_count)
        comments.extend(synthetic)
        
    # Write to target raw JSON file
    print(f"[*] Writing {len(comments)} total comments to {RAW_DATA_PATH}...")
    with open(RAW_DATA_PATH, "w", encoding="utf-8") as f:
        for comment in comments:
            f.write(json.dumps(comment) + "\n")
            
    print(f"[SUCCESS] Ingestion completed. Data stored in {RAW_DATA_PATH}.")

if __name__ == "__main__":
    main()
