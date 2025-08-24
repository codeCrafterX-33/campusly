#!/usr/bin/env python3
"""
Free API script for on-demand university state fetching.
Uses OpenStreetMap/Nominatim API which is completely free.
"""

import json
import requests
import time
from typing import Dict, List, Optional
from datetime import datetime

class FreeGeocodingAPI:
    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org"
        self.requests_made = 0
        self.max_requests_per_second = 1  # Nominatim allows 1 request per second
        
    def search_place(self, query: str) -> Optional[Dict]:
        """Search for a place using OpenStreetMap/Nominatim API"""
        if self.requests_made > 0:
            # Respect rate limit
            time.sleep(1.1)  # Wait slightly more than 1 second
            
        search_url = f"{self.base_url}/search"
        params = {
            "q": query,
            "format": "json",
            "addressdetails": 1,
            "limit": 1,
            "countrycodes": "",  # Will be set based on country
            "accept-language": "en"
        }
        
        try:
            response = requests.get(search_url, params=params, timeout=10)
            self.requests_made += 1
            
            if response.status_code == 200:
                data = response.json()
                
                if data and len(data) > 0:
                    return data[0]  # Return first result
                else:
                    print(f"⚠️  No results found for: {query}")
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
    
    def extract_state_from_place(self, place: Dict, country: str) -> Optional[str]:
        """Extract state/province from Nominatim result"""
        try:
            address = place.get("address", {})
            
            # Try different state fields based on country
            if country == "United States":
                # US states
                state = (address.get("state") or 
                        address.get("province") or
                        address.get("region"))
                if state:
                    # Convert to state abbreviation
                    return self.convert_us_state_to_abbr(state)
                    
            elif country == "Canada":
                # Canadian provinces
                state = (address.get("state") or 
                        address.get("province") or
                        address.get("region"))
                if state:
                    return self.convert_canada_province_to_abbr(state)
                    
            elif country == "Australia":
                # Australian states
                state = (address.get("state") or 
                        address.get("province") or
                        address.get("region"))
                if state:
                    return self.convert_australia_state_to_abbr(state)
                    
            elif country == "Germany":
                # German states
                state = (address.get("state") or 
                        address.get("province") or
                        address.get("region"))
                if state:
                    return self.convert_germany_state_to_abbr(state)
                    
            elif country == "India":
                # Indian states
                state = (address.get("state") or 
                        address.get("province") or
                        address.get("region"))
                if state:
                    return self.convert_india_state_to_abbr(state)
            
            # Generic fallback for other countries
            state = (address.get("state") or 
                    address.get("province") or
                    address.get("region"))
            
            return state
            
        except Exception as e:
            print(f"Error extracting state: {e}")
        
        return None
    
    def convert_us_state_to_abbr(self, state_name: str) -> str:
        """Convert US state name to abbreviation"""
        us_states = {
            "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
            "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
            "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
            "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
            "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
            "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
            "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
            "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
            "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
            "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
            "District of Columbia": "DC"
        }
        
        return us_states.get(state_name, state_name)
    
    def convert_canada_province_to_abbr(self, province_name: str) -> str:
        """Convert Canadian province name to abbreviation"""
        canada_provinces = {
            "Alberta": "AB", "British Columbia": "BC", "Manitoba": "MB", "New Brunswick": "NB",
            "Newfoundland and Labrador": "NL", "Nova Scotia": "NS", "Ontario": "ON", "Prince Edward Island": "PE",
            "Quebec": "QC", "Saskatchewan": "SK", "Northwest Territories": "NT", "Nunavut": "NU", "Yukon": "YT"
        }
        
        return canada_provinces.get(province_name, province_name)
    
    def convert_australia_state_to_abbr(self, state_name: str) -> str:
        """Convert Australian state name to abbreviation"""
        australia_states = {
            "New South Wales": "NSW", "Victoria": "VIC", "Queensland": "QLD", "Western Australia": "WA",
            "South Australia": "SA", "Tasmania": "TAS", "Australian Capital Territory": "ACT", "Northern Territory": "NT"
        }
        
        return australia_states.get(state_name, state_name)
    
    def convert_germany_state_to_abbr(self, state_name: str) -> str:
        """Convert German state name to abbreviation"""
        germany_states = {
            "Baden-Württemberg": "BW", "Bavaria": "BY", "Berlin": "BE", "Brandenburg": "BB", "Bremen": "HB",
            "Hamburg": "HH", "Hesse": "HE", "Lower Saxony": "NI", "Mecklenburg-Vorpommern": "MV",
            "North Rhine-Westphalia": "NW", "Rhineland-Palatinate": "RP", "Saarland": "SL", "Saxony": "SN",
            "Saxony-Anhalt": "ST", "Schleswig-Holstein": "SH", "Thuringia": "TH"
        }
        
        return germany_states.get(state_name, state_name)
    
    def convert_india_state_to_abbr(self, state_name: str) -> str:
        """Convert Indian state name to abbreviation"""
        india_states = {
            "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR", "Assam": "AS", "Bihar": "BR", "Chhattisgarh": "CG",
            "Goa": "GA", "Gujarat": "GJ", "Haryana": "HR", "Himachal Pradesh": "HP", "Jharkhand": "JH",
            "Karnataka": "KA", "Kerala": "KL", "Madhya Pradesh": "MP", "Maharashtra": "MH", "Manipur": "MN",
            "Meghalaya": "ML", "Mizoram": "MZ", "Nagaland": "NL", "Odisha": "OD", "Punjab": "PB",
            "Rajasthan": "RJ", "Sikkim": "SK", "Tamil Nadu": "TN", "Telangana": "TS", "Tripura": "TR",
            "Uttar Pradesh": "UP", "Uttarakhand": "UK", "West Bengal": "WB"
        }
        
        return india_states.get(state_name, state_name)

def test_free_api():
    """Test the free API with sample universities"""
    
    api = FreeGeocodingAPI()
    
    test_universities = [
        {"name": "Stanford University", "country": "United States"},
        {"name": "University of Toronto", "country": "Canada"},
        {"name": "University of Sydney", "country": "Australia"},
        {"name": "Technical University of Munich", "country": "Germany"},
        {"name": "Indian Institute of Technology Bombay", "country": "India"}
    ]
    
    print("🧪 Testing Free Geocoding API (OpenStreetMap/Nominatim)")
    print("=" * 60)
    
    for university in test_universities:
        name = university["name"]
        country = university["country"]
        
        print(f"\n🔍 Searching: {name} in {country}")
        
        # Search for the university
        query = f"{name} {country}"
        place = api.search_place(query)
        
        if place:
            # Extract state from the place result
            state = api.extract_state_from_place(place, country)
            
            if state:
                print(f"  ✅ Found state: {state}")
            else:
                print(f"  ⚠️  Could not extract state from place data")
        else:
            print(f"  ❌ Could not find place data")
        
        # Small delay between requests
        time.sleep(1.1)
    
    print("\n✅ Test completed!")
    print("\nTo use this in your app:")
    print("1. Import the FreeGeocodingAPI class")
    print("2. Call it when users select universities")
    print("3. Cache the results in your universities list")

if __name__ == "__main__":
    test_free_api()
