import axios from "axios";

interface GeocodingResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address: {
    university?: string;
    college?: string;
    school?: string;
    state?: string;
    province?: string;
    region?: string;
    country?: string;
    postcode?: string;
  };
}

class FreeGeocodingAPI {
  private baseURL = "https://nominatim.openstreetmap.org";
  private lastRequestTime = 0;
  private minRequestInterval = 1100; // 1.1 seconds between requests (respect rate limit)

  /**
   * Search for a place using OpenStreetMap/Nominatim API
   * @param query - Search query (e.g., "Stanford University United States")
   * @returns Promise with geocoding result or null
   */
  async searchPlace(query: string): Promise<GeocodingResult | null> {
    try {
      // Respect rate limit
      await this.respectRateLimit();

      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 1,
          "accept-language": "en",
        },
        timeout: 10000,
      });

      if (
        response.status === 200 &&
        response.data &&
        response.data.length > 0
      ) {
        return response.data[0] as GeocodingResult;
      }

      return null;
    } catch (error) {
      console.warn("Geocoding API error:", error);
      return null;
    }
  }

  /**
   * Extract state/province information from geocoding result
   * @param result - Geocoding result from searchPlace
   * @param country - Country name for context
   * @returns State/province abbreviation or full name
   */
  extractStateFromResult(
    result: GeocodingResult,
    country: string
  ): string | null {
    try {
      const address = result.address;

      // Try different state fields based on country
      let state = address.state || address.province || address.region;

      if (!state) return null;

      // Convert to abbreviation based on country
      switch (country) {
        case "United States":
          return this.convertUSStateToAbbr(state);
        case "Canada":
          return this.convertCanadaProvinceToAbbr(state);
        case "Australia":
          return this.convertAustraliaStateToAbbr(state);
        case "Germany":
          return this.convertGermanyStateToAbbr(state);
        case "India":
          return this.convertIndiaStateToAbbr(state);
        default:
          return state; // Return as-is for other countries
      }
    } catch (error) {
      console.warn("Error extracting state:", error);
      return null;
    }
  }

  /**
   * Fetch state information for a university
   * @param universityName - Name of the university
   * @param country - Country of the university
   * @returns Promise with state abbreviation or null
   */
  async getUniversityState(
    universityName: string,
    country: string
  ): Promise<string | null> {
    try {
      const query = `${universityName} ${country}`;
      const result = await this.searchPlace(query);

      if (result) {
        return this.extractStateFromResult(result, country);
      }

      return null;
    } catch (error) {
      console.warn("Error getting university state:", error);
      return null;
    }
  }

  /**
   * Respect API rate limit (1 request per second)
   */
  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  // State conversion methods
  private convertUSStateToAbbr(stateName: string): string {
    const usStates: { [key: string]: string } = {
      Alabama: "AL",
      Alaska: "AK",
      Arizona: "AZ",
      Arkansas: "AR",
      California: "CA",
      Colorado: "CO",
      Connecticut: "CT",
      Delaware: "DE",
      Florida: "FL",
      Georgia: "GA",
      Hawaii: "HI",
      Idaho: "ID",
      Illinois: "IL",
      Indiana: "IN",
      Iowa: "IA",
      Kansas: "KS",
      Kentucky: "KY",
      Louisiana: "LA",
      Maine: "ME",
      Maryland: "MD",
      Massachusetts: "MA",
      Michigan: "MI",
      Minnesota: "MN",
      Mississippi: "MS",
      Missouri: "MO",
      Montana: "MT",
      Nebraska: "NE",
      Nevada: "NV",
      "New Hampshire": "NH",
      "New Jersey": "NJ",
      "New Mexico": "NM",
      "New York": "NY",
      "North Carolina": "NC",
      "North Dakota": "ND",
      Ohio: "OH",
      Oklahoma: "OK",
      Oregon: "OR",
      Pennsylvania: "PA",
      "Rhode Island": "RI",
      "South Carolina": "SC",
      "South Dakota": "SD",
      Tennessee: "TN",
      Texas: "TX",
      Utah: "UT",
      Vermont: "VT",
      Virginia: "VA",
      Washington: "WA",
      "West Virginia": "WV",
      Wisconsin: "WI",
      Wyoming: "WY",
      "District of Columbia": "DC",
    };

    return usStates[stateName] || stateName;
  }

  private convertCanadaProvinceToAbbr(provinceName: string): string {
    const canadaProvinces: { [key: string]: string } = {
      Alberta: "AB",
      "British Columbia": "BC",
      Manitoba: "MB",
      "New Brunswick": "NB",
      "Newfoundland and Labrador": "NL",
      "Nova Scotia": "NS",
      Ontario: "ON",
      "Prince Edward Island": "PE",
      Quebec: "QC",
      Saskatchewan: "SK",
      "Northwest Territories": "NT",
      Nunavut: "NU",
      Yukon: "YT",
    };

    return canadaProvinces[provinceName] || provinceName;
  }

  private convertAustraliaStateToAbbr(stateName: string): string {
    const australiaStates: { [key: string]: string } = {
      "New South Wales": "NSW",
      Victoria: "VIC",
      Queensland: "QLD",
      "Western Australia": "WA",
      "South Australia": "SA",
      Tasmania: "TAS",
      "Australian Capital Territory": "ACT",
      "Northern Territory": "NT",
    };

    return australiaStates[stateName] || stateName;
  }

  private convertGermanyStateToAbbr(stateName: string): string {
    const germanyStates: { [key: string]: string } = {
      "Baden-Württemberg": "BW",
      Bavaria: "BY",
      Berlin: "BE",
      Brandenburg: "BB",
      Bremen: "HB",
      Hamburg: "HH",
      Hesse: "HE",
      "Lower Saxony": "NI",
      "Mecklenburg-Vorpommern": "MV",
      "North Rhine-Westphalia": "NW",
      "Rhineland-Palatinate": "RP",
      Saarland: "SL",
      Saxony: "SN",
      "Saxony-Anhalt": "ST",
      "Schleswig-Holstein": "SH",
      Thuringia: "TH",
    };

    return germanyStates[stateName] || stateName;
  }

  private convertIndiaStateToAbbr(stateName: string): string {
    const indiaStates: { [key: string]: string } = {
      "Andhra Pradesh": "AP",
      "Arunachal Pradesh": "AR",
      Assam: "AS",
      Bihar: "BR",
      Chhattisgarh: "CG",
      Goa: "GA",
      Gujarat: "GJ",
      Haryana: "HR",
      "Himachal Pradesh": "HP",
      Jharkhand: "JH",
      Karnataka: "KA",
      Kerala: "KL",
      "Madhya Pradesh": "MP",
      Maharashtra: "MH",
      Manipur: "MN",
      Meghalaya: "ML",
      Mizoram: "MZ",
      Nagaland: "NL",
      Odisha: "OD",
      Punjab: "PB",
      Rajasthan: "RJ",
      Sikkim: "SK",
      "Tamil Nadu": "TN",
      Telangana: "TS",
      Tripura: "TR",
      "Uttar Pradesh": "UP",
      Uttarakhand: "UK",
      "West Bengal": "WB",
    };

    return indiaStates[stateName] || stateName;
  }
}

// Export singleton instance
export const freeGeocodingAPI = new FreeGeocodingAPI();

// Export the class for testing
export default FreeGeocodingAPI;
