import os
import requests
import json
import sys
import argparse
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Configuration
SANITY_PROJECT_ID = os.getenv('PUBLIC_SANITY_PROJECT_ID', 'k4t36b6u')
SANITY_DATASET = os.getenv('PUBLIC_SANITY_DATASET', 'production')
SANITY_WRITE_TOKEN = os.getenv('SANITY_WRITE_TOKEN')
GOOGLE_BOOKS_API_KEY = os.getenv('GOOGLE_BOOKS_API_KEY')
API_VERSION = '2024-03-12'

BASE_URL = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{API_VERSION}"
HEADERS = {
    "Authorization": f"Bearer {SANITY_WRITE_TOKEN}",
    "Content-Type": "application/json"
}

def fetch_from_openlibrary(isbn):
    """Fallback: Fetch from Open Library."""
    url = f"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        key = f"ISBN:{isbn}"
        if key not in data: return None
        
        info = data[key]
        return {
            "title": info.get("title"),
            "author": ", ".join([a.get("name") for a in info.get("authors", [])]),
            "cover_url": info.get("cover", {}).get("large"),
            "subjects": [s.get("name") for s in info.get("subjects", [])[:5]]
        }
    except: return None

def fetch_book_metadata(isbn):
    """Fetch book details, prioritizing Google Books if API key is present."""
    if not GOOGLE_BOOKS_API_KEY:
        print("[!] No Google Books API Key found, using Open Library only...")
        return fetch_from_openlibrary(isbn)

    print(f"[*] Fetching metadata for ISBN: {isbn} from Google Books...")
    url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}&key={GOOGLE_BOOKS_API_KEY}"
    
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if "items" not in data or len(data["items"]) == 0:
            print(f"[?] Not found on Google Books, trying Open Library...")
            return fetch_from_openlibrary(isbn)
            
        volume_info = data["items"][0]["volumeInfo"]
        
        # Get cover with highest quality
        images = volume_info.get("imageLinks", {})
        cover_url = images.get("extraLarge") or images.get("large") or images.get("medium") or images.get("thumbnail")
        if cover_url:
            cover_url = cover_url.replace("http://", "https://")

        metadata = {
            "title": volume_info.get("title", "Unknown Title"),
            "author": ", ".join(volume_info.get("authors", ["Unknown Author"])),
            "cover_url": cover_url,
            "subjects": volume_info.get("categories", [])
        }
        return metadata
    except Exception as e:
        print(f"[!] Google Books API error: {e}")
        return fetch_from_openlibrary(isbn)

def upload_image_to_sanity(image_url):
    """Download image and upload as Sanity asset."""
    if not image_url:
        return None
        
    print(f"[*] Uploading cover image...")
    try:
        image_res = requests.get(image_url, timeout=15)
        if image_res.status_code != 200:
            print(f"[!] Failed to download image from {image_url}")
            return None
    except Exception as e:
        print(f"[!] Failed to download image: {e}")
        return None
        
    upload_url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{API_VERSION}/assets/images/{SANITY_DATASET}"
    upload_headers = {
        "Authorization": f"Bearer {SANITY_WRITE_TOKEN}",
        "Content-Type": "image/jpeg"
    }
    
    response = requests.post(upload_url, headers=upload_headers, data=image_res.content)
    # Sanity returns 201 for new, 200 for existing asset
    if response.status_code in [200, 201]:
        return response.json()["document"]["_id"]
    else:
        print(f"[!] Image upload failed (Status {response.status_code}): {response.text}")
        return None

def create_sanity_book(isbn, metadata, image_asset_id, series_name=None, order=None, status="shortlist", extra_genres=None):
    """Create or update a book document in Sanity."""
    print(f"[*] Creating document for '{metadata['title']}'...")
    
    allowed_statuses = ["shortlist", "reading", "finished"]
    final_status = status.lower() if status.lower() in allowed_statuses else "shortlist"

    # Merge subjects from API with extra genres from user
    final_genres = metadata["subjects"]
    if extra_genres:
        # Merge and remove duplicates
        final_genres = list(dict.fromkeys(extra_genres + final_genres))

    doc_id = f"book-{isbn}"
    book_doc = {
        "_id": doc_id,
        "_type": "book",
        "title": metadata["title"],
        "author": metadata["author"],
        "status": final_status,
        "progress": 0 if final_status != "finished" else 100,
        "physicalCopy": False,
        "genres": final_genres
    }
    
    if series_name:
        book_doc["series"] = series_name
    if order is not None:
        book_doc["seriesOrder"] = order
    
    if image_asset_id:
        book_doc["cover"] = {
            "_type": "image",
            "asset": {
                "_type": "reference",
                "_ref": image_asset_id
            }
        }
        
    mutation = {
        "mutations": [
            {
                "createOrReplace": book_doc
            }
        ]
    }
    
    mutate_url = f"{BASE_URL}/data/mutate/{SANITY_DATASET}"
    response = requests.post(mutate_url, headers=HEADERS, data=json.dumps(mutation))
    
    if response.status_code == 200:
        print(f"[+] Successfully imported: {metadata['title']} ({final_status})")
    else:
        print(f"[!] Failed to create document: {response.text}")

def main():
    parser = argparse.ArgumentParser(description="Import books into Sanity using ISBNs.")
    parser.add_argument("--series", "-s", help="Series name")
    parser.add_argument("--status", help="Initial status (shortlist, reading, finished)")
    parser.add_argument("--genres", "-g", help="Comma-separated genres/tags")
    parser.add_argument("--start", "-n", type=int, help="Starting sequence number for series")
    args = parser.parse_args()

    if not SANITY_WRITE_TOKEN:
        print("[!] Error: SANITY_WRITE_TOKEN not found in environment. Please add it to your .env file.")
        return

    isbns_file = "scripts/isbns.txt"
    if not os.path.exists(isbns_file):
        print(f"[!] Error: {isbns_file} not found.")
        return

    # Parsing flags from file headers
    file_series = None
    file_status = None
    file_genres = None
    file_start = None
    isbns = []

    with open(isbns_file, "r") as f:
        for line in f:
            clean_line = line.strip()
            if not clean_line:
                continue
            if clean_line.startswith("#"):
                lower_line = clean_line.lower()
                if "series:" in lower_line:
                    file_series = clean_line.split(":", 1)[1].strip()
                elif "status:" in lower_line:
                    file_status = clean_line.split(":", 1)[1].strip()
                elif "genres:" in lower_line or "genre:" in lower_line:
                    file_genres = clean_line.split(":", 1)[1].strip()
                elif "start:" in lower_line or "startingnumber:" in lower_line:
                    try:
                        file_start = int(clean_line.split(":", 1)[1].strip())
                    except: pass
                continue
            isbns.append(clean_line)

    # Resolve final values (CLI overrides file)
    final_series = args.series or file_series
    final_status = args.status or file_status or "shortlist"
    
    final_start = 1
    if args.start is not None:
        final_start = args.start
    elif file_start is not None:
        final_start = file_start
    
    extra_genres = []
    genre_source = args.genres or file_genres
    if genre_source:
        extra_genres = [g.strip() for g in genre_source.split(",") if g.strip()]

    if final_series:
        print(f"[*] Global Series set to: {final_series} (Starting at #{final_start})")
    print(f"[*] Global Status set to: {final_status}")
    if extra_genres:
        print(f"[*] Extra Genres: {', '.join(extra_genres)}")

    if not isbns:
        print("[!] No ISBNs found to process.")
        return

    print(f"[*] Starting import of {len(isbns)} books...")
    for idx, isbn_raw in enumerate(isbns):
        # Clean ISBN: remove hyphens and spaces
        isbn = isbn_raw.replace("-", "").replace(" ", "").strip()
        
        metadata = fetch_book_metadata(isbn)
        if metadata:
            asset_id = upload_image_to_sanity(metadata["cover_url"])
            # Calculate current sequence number
            current_order = final_start + idx if final_series else None
            create_sanity_book(isbn, metadata, asset_id, final_series, current_order, final_status, extra_genres)
    
    print("[*] Done!")

if __name__ == "__main__":
    main()


