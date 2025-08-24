#!/usr/bin/env python3
"""
Script to add state/province information to world universities list.
This script will process the existing JSON file and add state/province data
for universities in countries that have states/provinces.
"""

import json
import re
from typing import Dict, List, Optional

# State/Province mappings for major countries
US_STATES = {
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

CANADIAN_PROVINCES = {
    "Alberta": "AB", "British Columbia": "BC", "Manitoba": "MB", "New Brunswick": "NB",
    "Newfoundland and Labrador": "NL", "Nova Scotia": "NS", "Ontario": "ON", "Prince Edward Island": "PE",
    "Quebec": "QC", "Saskatchewan": "SK", "Northwest Territories": "NT", "Nunavut": "NU", "Yukon": "YT"
}

AUSTRALIAN_STATES = {
    "New South Wales": "NSW", "Victoria": "VIC", "Queensland": "QLD", "Western Australia": "WA",
    "South Australia": "SA", "Tasmania": "TAS", "Australian Capital Territory": "ACT", "Northern Territory": "NT"
}

GERMAN_STATES = {
    "Baden-Württemberg": "BW", "Bavaria": "BY", "Berlin": "BE", "Brandenburg": "BB", "Bremen": "HB",
    "Hamburg": "HH", "Hesse": "HE", "Lower Saxony": "NI", "Mecklenburg-Vorpommern": "MV",
    "North Rhine-Westphalia": "NW", "Rhineland-Palatinate": "RP", "Saarland": "SL", "Saxony": "SN",
    "Saxony-Anhalt": "ST", "Schleswig-Holstein": "SH", "Thuringia": "TH"
}

INDIA_STATES = {
    "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR", "Assam": "AS", "Bihar": "BR", "Chhattisgarh": "CG",
    "Goa": "GA", "Gujarat": "GJ", "Haryana": "HR", "Himachal Pradesh": "HP", "Jharkhand": "JH",
    "Karnataka": "KA", "Kerala": "KL", "Madhya Pradesh": "MP", "Maharashtra": "MH", "Manipur": "MN",
    "Meghalaya": "ML", "Mizoram": "MZ", "Nagaland": "NL", "Odisha": "OD", "Punjab": "PB",
    "Rajasthan": "RJ", "Sikkim": "SK", "Tamil Nadu": "TN", "Telangana": "TS", "Tripura": "TR",
    "Uttar Pradesh": "UP", "Uttarakhand": "UK", "West Bengal": "WB"
}

# Common city-state patterns for US universities
US_CITY_STATE_PATTERNS = [
    (r"University of (\w+)(?: at| in)? (\w+)", "US"),
    (r"(\w+) University(?: of| at| in)? (\w+)", "US"),
    (r"(\w+) College(?: of| at| in)? (\w+)", "US"),
    (r"(\w+) Institute(?: of| at| in)? (\w+)", "US"),
    (r"(\w+) State University", "US"),
    (r"(\w+) State College", "US"),
    (r"(\w+) University", "US"),
]

def extract_state_from_name(university_name: str, country: str) -> Optional[str]:
    """Extract state/province from university name based on country."""
    
    if country == "United States":
        # Check for state abbreviations in parentheses
        state_match = re.search(r'\(([A-Z]{2})\)', university_name)
        if state_match:
            return state_match.group(1)
        
        # Check for common state patterns
        for state_name, state_code in US_STATES.items():
            if state_name.lower() in university_name.lower():
                return state_code
        
        # Check for city-state patterns
        for pattern, _ in US_CITY_STATE_PATTERNS:
            match = re.search(pattern, university_name, re.IGNORECASE)
            if match:
                # Try to match the second group with a state
                potential_state = match.group(2)
                for state_name, state_code in US_STATES.items():
                    if state_name.lower() in potential_state.lower():
                        return state_code
        
        # Common city-state mappings
        city_state_map = {
            "New York": "NY", "Los Angeles": "CA", "Chicago": "IL", "Houston": "TX",
            "Phoenix": "AZ", "Philadelphia": "PA", "San Antonio": "TX", "San Diego": "CA",
            "Dallas": "TX", "San Jose": "CA", "Austin": "TX", "Jacksonville": "FL",
            "Fort Worth": "TX", "Columbus": "OH", "Charlotte": "NC", "San Francisco": "CA",
            "Indianapolis": "IN", "Seattle": "WA", "Denver": "CO", "Washington": "DC",
            "Boston": "MA", "El Paso": "TX", "Nashville": "TN", "Detroit": "MI",
            "Oklahoma City": "OK", "Portland": "OR", "Las Vegas": "NV", "Memphis": "TN",
            "Louisville": "KY", "Baltimore": "MD", "Milwaukee": "WI", "Albuquerque": "NM",
            "Tucson": "AZ", "Fresno": "CA", "Sacramento": "CA", "Kansas City": "MO",
            "Mesa": "AZ", "Atlanta": "GA", "Long Beach": "CA", "Colorado Springs": "CO",
            "Raleigh": "NC", "Miami": "FL", "Virginia Beach": "VA", "Omaha": "NE",
            "Oakland": "CA", "Minneapolis": "MN", "Tulsa": "OK", "Arlington": "TX",
            "Tampa": "FL", "New Orleans": "LA", "Wichita": "KS", "Cleveland": "OH",
            "Bakersfield": "CA", "Aurora": "CO", "Anaheim": "CA", "Honolulu": "HI",
            "Santa Ana": "CA", "Corpus Christi": "TX", "Riverside": "CA", "Lexington": "KY",
            "Stockton": "CA", "Henderson": "NV", "Saint Paul": "MN", "St. Louis": "MO",
            "Chula Vista": "CA", "Orlando": "FL", "San Jose": "CA", "Laredo": "TX",
            "Chandler": "AZ", "Madison": "WI", "Lubbock": "TX", "Scottsdale": "AZ",
            "Reno": "NV", "Buffalo": "NY", "Gilbert": "AZ", "Glendale": "AZ",
            "North Las Vegas": "NV", "Fremont": "CA", "Boise": "ID", "Irvine": "CA"
        }
        
        for city, state in city_state_map.items():
            if city.lower() in university_name.lower():
                return state
    
    elif country == "Canada":
        for province_name, province_code in CANADIAN_PROVINCES.items():
            if province_name.lower() in university_name.lower():
                return province_code
        
        # Common Canadian city-province mappings
        city_province_map = {
            "Toronto": "ON", "Montreal": "QC", "Vancouver": "BC", "Calgary": "AB",
            "Edmonton": "AB", "Ottawa": "ON", "Winnipeg": "MB", "Quebec City": "QC",
            "Hamilton": "ON", "Kitchener": "ON", "London": "ON", "Victoria": "BC",
            "Halifax": "NS", "Saskatoon": "SK", "Regina": "SK", "St. John's": "NL"
        }
        
        for city, province in city_province_map.items():
            if city.lower() in university_name.lower():
                return province
    
    elif country == "Australia":
        for state_name, state_code in AUSTRALIAN_STATES.items():
            if state_name.lower() in university_name.lower():
                return state_code
        
        # Common Australian city-state mappings
        city_state_map = {
            "Sydney": "NSW", "Melbourne": "VIC", "Brisbane": "QLD", "Perth": "WA",
            "Adelaide": "SA", "Hobart": "TAS", "Canberra": "ACT", "Darwin": "NT"
        }
        
        for city, state in city_state_map.items():
            if city.lower() in university_name.lower():
                return state
    
    elif country == "Germany":
        for state_name, state_code in GERMAN_STATES.items():
            if state_name.lower() in university_name.lower():
                return state_code
    
    elif country == "India":
        for state_name, state_code in INDIA_STATES.items():
            if state_name.lower() in university_name.lower():
                return state_code
    
    return None

def add_states_to_universities(input_file: str, output_file: str):
    """Process the universities JSON file and add state/province information."""
    
    print(f"Reading universities from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        universities = json.load(f)
    
    print(f"Processing {len(universities)} universities...")
    
    updated_count = 0
    for university in universities:
        if "country" in university:
            country = university["country"]
            university_name = university.get("name", "")
            
            # Extract state/province
            state = extract_state_from_name(university_name, country)
            
            if state:
                university["state"] = state
                updated_count += 1
    
    print(f"Added state/province information to {updated_count} universities.")
    
    # Save updated data
    print(f"Saving updated universities to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(universities, f, indent=2, ensure_ascii=False)
    
    print("Done! State/province information has been added to the universities list.")

if __name__ == "__main__":
    input_file = "app/assets/world_universities_and_domains.json"
    output_file = "app/assets/world_universities_with_states.json"
    
    try:
        add_states_to_universities(input_file, output_file)
    except FileNotFoundError:
        print(f"Error: Could not find {input_file}")
        print("Please make sure the file exists and the path is correct.")
    except Exception as e:
        print(f"Error: {e}")
