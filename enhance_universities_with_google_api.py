#!/usr/bin/env python3
"""
Enhanced script to add state/province information using Google Places API.
This script will process universities that don't have state info and fetch it from Google.
"""

import json
import requests
import time
from typing import Dict, List, Optional
import os
from datetime import datetime

class GooglePlacesAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://maps.googleapis.com/maps/api/place"
        self.requests_made = 0
        self.max_requests = 100000  # Google Places API daily limit
        
    def search_place(self, query: str) -> Optional[Dict]:
        """Search for a place using Google Places API"""
        if self.requests_made >= self.max_requests:
            print("⚠️  API request limit reached!")
            return None
            
        search_url = f"{self.base_url}/textsearch/json"
        params = {
            "query": query,
            "key": self.api_key
        }
        
        try:
            response = requests.get(search_url, params=params, timeout=10)
            self.requests_made += 1
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("status") == "OK" and data.get("results"):
                    return data["results"][0]  # Return first result
                elif data.get("status") == "OVER_QUERY_LIMIT":
                    print("⚠️  API quota exceeded. Please try again later.")
                    return None
                elif data.get("status") == "REQUEST_DENIED":
                    print("❌ API request denied. Check your API key and billing.")
                    return None
                else:
                    print(f"⚠️  API returned status: {data.get('status')}")
                    return None
            else:
                print(f"❌ HTTP error: {response.status_code}")
                return None
                
        except requests.exceptions.Timeout:
            print("⏰ Request timeout")
            return None
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error: {e}")
            return None
    
    def extract_state_from_place(self, place: Dict) -> Optional[str]:
        """Extract state/province from Google Places result"""
        try:
            address_components = place.get("address_components", [])
            
            # Look for administrative_area_level_1 (state/province)
            for component in address_components:
                types = component.get("types", [])
                if "administrative_area_level_1" in types:
                    return component.get("short_name")  # Returns "CA", "NY", etc.
            
            # Fallback: try to extract from formatted_address
            formatted_address = place.get("formatted_address", "")
            if formatted_address:
                # Common patterns for state extraction
                import re
                
                # US state pattern (2 capital letters)
                us_state_match = re.search(r', ([A-Z]{2})\s*\d{5}', formatted_address)
                if us_state_match:
                    return us_state_match.group(1)
                
                # Canadian province pattern
                canada_provinces = ["ON", "BC", "AB", "QC", "NS", "NB", "MB", "SK", "PE", "NL", "NT", "NU", "YT"]
                for province in canada_provinces:
                    if f", {province}" in formatted_address:
                        return province
                        
        except Exception as e:
            print(f"Error extracting state: {e}")
        
        return None

def load_universities(file_path: str) -> List[Dict]:
    """Load universities from JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        return []
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON in file: {file_path}")
        return []

def save_universities(universities: List[Dict], file_path: str):
    """Save universities to JSON file"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(universities, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved {len(universities)} universities to {file_path}")
    except Exception as e:
        print(f"❌ Error saving file: {e}")

def enhance_universities_with_google_api(
    universities: List[Dict], 
    api_key: str, 
    batch_size: int = 10, 
    delay: float = 1.0
) -> Dict[str, int]:
    """Enhance universities with missing state info using Google Places API"""
    
    api = GooglePlacesAPI(api_key)
    stats = {
        "total_processed": 0,
        "states_added": 0,
        "failed": 0,
        "already_had_state": 0
    }
    
    # Filter universities that need state info
    universities_needing_state = [
        uni for uni in universities 
        if not uni.get("state") and uni.get("country")
    ]
    
    print(f"🎯 Found {len(universities_needing_state)} universities needing state info")
    print(f"📊 Total universities: {len(universities)}")
    
    if not universities_needing_state:
        print("✅ All universities already have state information!")
        return stats
    
    # Process in batches
    for i in range(0, len(universities_needing_state), batch_size):
        batch = universities_needing_state[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(universities_needing_state) + batch_size - 1) // batch_size
        
        print(f"\n🔄 Processing batch {batch_num}/{total_batches}")
        
        for j, university in enumerate(batch):
            university_name = university["name"]
            country = university["country"]
            
            print(f"  {i + j + 1}/{len(universities_needing_state)}: {university_name}")
            
            # Search for the university
            query = f"{university_name} {country}"
            place = api.search_place(query)
            
            if place:
                # Extract state from the place result
                state = api.extract_state_from_place(place)
                
                if state:
                    # Find the university in the original list and update it
                    for orig_uni in universities:
                        if (orig_uni["name"] == university_name and 
                            orig_uni["country"] == country):
                            orig_uni["state"] = state
                            stats["states_added"] += 1
                            print(f"    ✅ Added state: {state}")
                            break
                else:
                    print(f"    ⚠️  Could not extract state from place data")
                    stats["failed"] += 1
            else:
                print(f"    ❌ Could not find place data")
                stats["failed"] += 1
            
            stats["total_processed"] += 1
            
            # Small delay between individual requests
            time.sleep(0.1)
        
        # Delay between batches
        if i + batch_size < len(universities_needing_state):
            print(f"  ⏳ Waiting {delay} seconds before next batch...")
            time.sleep(delay)
    
    # Count universities that already had state info
    stats["already_had_state"] = len(universities) - len(universities_needing_state)
    
    return stats

def main():
    """Main function to enhance universities with Google Places API"""
    
    # Configuration
    input_file = "app/assets/world_universities_and_domains.json"
    output_file = "app/assets/world_universities_enhanced.json"
    
    # Get API key from environment variable or user input
    api_key = os.getenv("GOOGLE_PLACES_API_KEY")
    if not api_key:
        print("🔑 Google Places API Key not found in environment variables.")
        print("Please set GOOGLE_PLACES_API_KEY environment variable or enter it below:")
        api_key = input("Enter your Google Places API key: ").strip()
        
        if not api_key:
            print("❌ No API key provided. Exiting.")
            return
    
    print("🚀 Starting university state enhancement with Google Places API")
    print("=" * 70)
    
    # Load universities
    print(f"📖 Loading universities from {input_file}...")
    universities = load_universities(input_file)
    
    if not universities:
        print("❌ No universities loaded. Exiting.")
        return
    
    print(f"✅ Loaded {len(universities)} universities")
    
    # Check current state coverage
    universities_with_state = sum(1 for uni in universities if uni.get("state"))
    print(f"📊 Current state coverage: {universities_with_state}/{len(universities)} ({universities_with_state/len(universities)*100:.1f}%)")
    
    # Enhance universities
    print("\n🔍 Enhancing universities with missing state information...")
    stats = enhance_universities_with_google_api(
        universities=universities,
        api_key=api_key,
        batch_size=10,  # Process 10 at a time
        delay=1.0       # Wait 1 second between batches
    )
    
    # Print results
    print("\n" + "=" * 70)
    print("📊 ENHANCEMENT RESULTS")
    print("=" * 70)
    print(f"Total universities: {len(universities)}")
    print(f"Already had state: {stats['already_had_state']}")
    print(f"States added: {stats['states_added']}")
    print(f"Failed: {stats['failed']}")
    print(f"Total processed: {stats['total_processed']}")
    
    # Calculate new coverage
    new_coverage = stats['already_had_state'] + stats['states_added']
    print(f"\n📈 New state coverage: {new_coverage}/{len(universities)} ({new_coverage/len(universities)*100:.1f}%)")
    
    # Save enhanced data
    if stats['states_added'] > 0:
        print(f"\n💾 Saving enhanced universities to {output_file}...")
        save_universities(universities, output_file)
        
        # Also save a backup with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = f"app/assets/world_universities_backup_{timestamp}.json"
        save_universities(universities, backup_file)
        print(f"💾 Backup saved to {backup_file}")
    else:
        print("\n💡 No new states added. Original file unchanged.")
    
    print("\n✅ Enhancement process completed!")

if __name__ == "__main__":
    main()
