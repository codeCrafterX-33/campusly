#!/usr/bin/env python3
"""
Simple test script to demonstrate state extraction from university names.
Run this to see how the state extraction logic works.
"""

import re

# Sample university data for testing
SAMPLE_UNIVERSITIES = [
    {
        "name": "Stanford University",
        "country": "United States",
        "domains": ["stanford.edu"]
    },
    {
        "name": "University of California, Berkeley",
        "country": "United States", 
        "domains": ["berkeley.edu"]
    },
    {
        "name": "University of Toronto",
        "country": "Canada",
        "domains": ["utoronto.ca"]
    },
    {
        "name": "University of Sydney",
        "country": "Australia",
        "domains": ["sydney.edu.au"]
    },
    {
        "name": "Technical University of Munich",
        "country": "Germany",
        "domains": ["tum.de"]
    },
    {
        "name": "Indian Institute of Technology Bombay",
        "country": "India",
        "domains": ["iitb.ac.in"]
    }
]

# State mappings (simplified version)
US_STATES = {
    "California": "CA", "New York": "NY", "Texas": "TX", "Florida": "FL",
    "Illinois": "IL", "Pennsylvania": "PA", "Ohio": "OH", "Michigan": "MI"
}

CANADIAN_PROVINCES = {
    "Ontario": "ON", "Quebec": "QC", "British Columbia": "BC", "Alberta": "AB"
}

AUSTRALIAN_STATES = {
    "New South Wales": "NSW", "Victoria": "VIC", "Queensland": "QLD"
}

GERMAN_STATES = {
    "Bavaria": "BY", "Berlin": "BE", "Hamburg": "HH", "Hesse": "HE"
}

INDIA_STATES = {
    "Maharashtra": "MH", "Karnataka": "KA", "Tamil Nadu": "TN", "Delhi": "DL"
}

def extract_state(university_name, country):
    """Extract state/province from university name."""
    
    if country == "United States":
        # Check for state names in university name
        for state_name, state_code in US_STATES.items():
            if state_name.lower() in university_name.lower():
                return state_code
        
        # Check for city-state patterns
        city_state_map = {
            "Stanford": "CA", "Berkeley": "CA", "Los Angeles": "CA",
            "New York": "NY", "Chicago": "IL", "Boston": "MA"
        }
        
        for city, state in city_state_map.items():
            if city.lower() in university_name.lower():
                return state
    
    elif country == "Canada":
        for province_name, province_code in CANADIAN_PROVINCES.items():
            if province_name.lower() in university_name.lower():
                return province_code
        
        city_province_map = {
            "Toronto": "ON", "Montreal": "QC", "Vancouver": "BC"
        }
        
        for city, province in city_province_map.items():
            if city.lower() in university_name.lower():
                return province
    
    elif country == "Australia":
        for state_name, state_code in AUSTRALIAN_STATES.items():
            if state_name.lower() in university_name.lower():
                return state_code
        
        city_state_map = {
            "Sydney": "NSW", "Melbourne": "VIC", "Brisbane": "QLD"
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

def test_extraction():
    """Test the state extraction with sample data."""
    
    print("🎓 Testing State/Province Extraction\n")
    print("=" * 60)
    
    for university in SAMPLE_UNIVERSITIES:
        name = university["name"]
        country = university["country"]
        state = extract_state(name, country)
        
        print(f"University: {name}")
        print(f"Country: {country}")
        print(f"State/Province: {state if state else 'Not found'}")
        print("-" * 40)
    
    print("\n✅ Test completed!")
    print("\nTo add states to your full universities list:")
    print("1. Run: python add_states_to_universities.py")
    print("2. Check the output file: world_universities_with_states.json")
    print("3. Update your app to use the new 'state' field")

if __name__ == "__main__":
    test_extraction()
