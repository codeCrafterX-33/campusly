# Google Places API Setup Guide

This guide will help you set up and use the Google Places API to enhance your universities list with accurate state/province information.

## 🚀 Quick Start

### 1. Get Google Places API Key

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing one
3. **Enable the Places API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click "Enable"
4. **Create credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### 2. Set Up Environment Variable (Recommended)

```bash
# Windows (PowerShell)
$env:GOOGLE_PLACES_API_KEY="your_api_key_here"

# Windows (Command Prompt)
set GOOGLE_PLACES_API_KEY=your_api_key_here

# macOS/Linux
export GOOGLE_PLACES_API_KEY="your_api_key_here"
```

### 3. Install Required Packages

```bash
pip install requests
```

### 4. Run the Enhancement Script

```bash
python enhance_universities_with_google_api.py
```

## 📊 What the Script Does

1. **Loads** your existing universities JSON file
2. **Identifies** universities missing state information
3. **Uses Google Places API** to search for each university
4. **Extracts** state/province from Google's location data
5. **Updates** your universities list with the new information
6. **Saves** enhanced data to a new file

## ⚙️ Configuration Options

You can modify these settings in the script:

```python
# Process universities in batches (to avoid overwhelming the API)
batch_size = 10  # Process 10 universities at a time

# Wait time between batches (to respect API rate limits)
delay = 1.0      # Wait 1 second between batches

# Input and output files
input_file = "app/assets/world_universities_and_domains.json"
output_file = "app/assets/world_universities_enhanced.json"
```

## 💰 API Costs

- **Google Places API**: $17 per 1000 requests
- **Typical usage**: 1 request per university
- **Your universities**: ~10,000+ universities
- **Estimated cost**: ~$170+ for complete enhancement

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for API keys
3. **Set up API key restrictions** in Google Cloud Console:
   - Restrict to specific IP addresses
   - Set daily quotas
   - Enable billing alerts

## 📈 Expected Results

After running the script, you should see:

```
🎯 Found 8,500 universities needing state info
📊 Total universities: 10,000

🔄 Processing batch 1/850
  ✅ Added state: CA for Stanford University
  ✅ Added state: NY for Columbia University
  ✅ Added state: MA for MIT

📊 ENHANCEMENT RESULTS
Total universities: 10,000
Already had state: 1,500
States added: 8,000
Failed: 500
Total processed: 8,500

📈 New state coverage: 9,500/10,000 (95.0%)
```

## 🚨 Troubleshooting

### Common Issues:

1. **"API request denied"**

   - Check your API key is correct
   - Ensure Places API is enabled
   - Verify billing is set up

2. **"API quota exceeded"**

   - Wait for quota reset (usually daily)
   - Reduce batch size or increase delays
   - Check your billing limits

3. **"Could not find place data"**
   - University name might be too generic
   - Try adding more context to search query
   - Some universities might not be in Google's database

### Performance Tips:

- **Start with a small subset** of universities for testing
- **Monitor API usage** in Google Cloud Console
- **Use appropriate delays** to avoid rate limiting
- **Process during off-peak hours** for better API performance

## 🔄 After Enhancement

Once you have the enhanced universities list:

1. **Review the results** for accuracy
2. **Update your app** to use the new `state` field
3. **Consider additional enhancements**:
   - Add coordinates (latitude/longitude)
   - Include time zones
   - Add regional information

## 📞 Support

If you encounter issues:

1. **Check Google Cloud Console** for API status
2. **Review API quotas** and billing
3. **Test with a single university** first
4. **Check the script logs** for detailed error messages

---

**Happy enhancing! 🎓✨**
