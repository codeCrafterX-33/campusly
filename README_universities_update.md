# Adding State/Province Information to World Universities List

This guide will help you add accurate state/province information to your world universities JSON file.

## What This Script Does

The Python script `add_states_to_universities.py` will:

1. **Read** your existing `world_universities_and_domains.json` file
2. **Analyze** university names and countries to extract state/province information
3. **Add** a new `"state"` field to each university entry where possible
4. **Save** the updated data to a new file

## Supported Countries

The script currently supports state/province extraction for:

- **United States** - All 50 states + DC (e.g., "CA", "NY", "TX")
- **Canada** - All provinces and territories (e.g., "ON", "BC", "QC")
- **Australia** - All states and territories (e.g., "NSW", "VIC", "QLD")
- **Germany** - All federal states (e.g., "BY", "BE", "HH")
- **India** - All states and union territories (e.g., "MH", "KA", "TN")

## How to Run

### Option 1: Run the Python Script

1. **Install Python** (if not already installed)
2. **Navigate** to your project directory
3. **Run the script**:
   ```bash
   python add_states_to_universities.py
   ```

### Option 2: Run with Python3

```bash
python3 add_states_to_universities.py
```

## What Happens

1. The script reads your existing universities file
2. It processes each university entry and tries to extract state/province information
3. It adds a `"state"` field with the appropriate abbreviation
4. It saves the updated data to `world_universities_with_states.json`

## Example Output

**Before:**

```json
{
  "name": "Stanford University",
  "country": "United States",
  "domains": ["stanford.edu"]
}
```

**After:**

```json
{
  "name": "Stanford University",
  "country": "United States",
  "domains": ["stanford.edu"],
  "state": "CA"
}
```

## How State Extraction Works

The script uses multiple strategies to determine state/province:

1. **Direct state names** in university names (e.g., "University of California" → "CA")
2. **City-state mappings** (e.g., "Stanford University" in Stanford, CA → "CA")
3. **Pattern matching** for common university naming conventions
4. **State abbreviations** already present in names

## After Running

1. **Review** the new `world_universities_with_states.json` file
2. **Replace** your original file with the updated one (or keep both)
3. **Update** your app to use the new `state` field

## Updating Your App

Once you have the updated universities list, you can:

1. **Display state information** in university search results
2. **Filter universities** by state/province
3. **Group universities** by geographic region
4. **Improve search accuracy** with location-based filtering

## Customization

You can modify the script to:

- **Add more countries** with their states/provinces
- **Adjust state abbreviations** to your preference
- **Add more city-state mappings** for better accuracy
- **Include additional geographic data** like regions or time zones

## Troubleshooting

- **File not found**: Make sure the script is in the same directory as your universities JSON file
- **Permission errors**: Ensure you have read/write permissions for the files
- **Large file issues**: The script handles large files but may take time to process

## Next Steps

After adding state information, consider:

1. **Geocoding** universities with latitude/longitude coordinates
2. **Adding time zones** for better user experience
3. **Including regional information** for multi-state universities
4. **Creating location-based search** features in your app
