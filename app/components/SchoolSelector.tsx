import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

// Fallback data in case the API is down
const FALLBACK_SCHOOLS = [
  {
    name: "Harvard University",
    domains: ["harvard.edu"],
    country: "United States",
    web_pages: ["https://www.harvard.edu/"],
    alpha_two_code: "US",
  },
  {
    name: "Stanford University",
    domains: ["stanford.edu"],
    country: "United States",
    web_pages: ["https://www.stanford.edu/"],
    alpha_two_code: "US",
  },
  {
    name: "MIT",
    domains: ["mit.edu"],
    country: "United States",
    web_pages: ["https://www.mit.edu/"],
    alpha_two_code: "US",
  },
];

interface School {
  name: string;
  domains: string[];
  country: string;
  web_pages: string[];
  alpha_two_code: string;
}

interface SelectedSchool {
  name: string;
  domain: string;
}

interface SchoolSelectorProps {
  onSelect?: (school: School) => void;
}

const SchoolSelector = ({ onSelect }: SchoolSelectorProps) => {
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [results, setResults] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SelectedSchool | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 2) fetchSchools();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API
      const res = await axios.get<School[]>(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/api/schools?name=middle`,
        { timeout: 5000 } // Add timeout to prevent long waits
      );

      setResults(res.data);
      console.log(res.data);
    } catch (err) {
      console.log("Failed to fetch schools", err);

      // Use fallback data if API fails
      const filteredFallback = FALLBACK_SCHOOLS.filter((school) =>
        school.name.toLowerCase().includes(query.toLowerCase())
      );

      setResults(filteredFallback);
      setError("Network error. Using offline data.");
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid email format.");
      return;
    }

    const domainFromEmail = email.split("@")[1].toLowerCase();
    const schoolDomain = selectedSchool?.domain?.toLowerCase();

    if (!schoolDomain) {
      Alert.alert("Selected school has no domain info.");
      return;
    }

    if (
      domainFromEmail === schoolDomain ||
      domainFromEmail.endsWith(`.${schoolDomain}`)
    ) {
      Alert.alert("✅ Email matches the school's domain!");
    } else {
      Alert.alert("❌ Email does not match the school's domain.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search Your School</Text>
      <TextInput
        style={styles.input}
        placeholder="Type school name..."
        value={query}
        onChangeText={setQuery}
      />

      {loading && <ActivityIndicator size="small" color="#555" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => item.name}
        style={{ maxHeight: 150 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.schoolItem}
            onPress={() => {
              setSelectedSchool({ name: item.name, domain: item.domains[0] });
              if (onSelect) onSelect(item);
              setResults([]);
              setQuery(item.name);
            }}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {selectedSchool && (
        <View style={styles.selected}>
          <Text>Selected School:</Text>
          <Text style={{ fontWeight: "bold" }}>{selectedSchool.name}</Text>
          <Text>Domain: {selectedSchool.domain}</Text>
        </View>
      )}

      <Text style={[styles.heading, { marginTop: 20 }]}>
        Enter School Email
      </Text>
      <TextInput
        style={styles.input}
        placeholder="example@school.edu"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[
          styles.verifyBtn,
          !(email && selectedSchool) && { backgroundColor: "#ccc" },
        ]}
        onPress={verifyEmail}
        disabled={!email || !selectedSchool}
      >
        <Text style={{ color: "white" }}>Verify Email</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SchoolSelector;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#f9f9f9",
  },
  heading: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  schoolItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selected: {
    marginTop: 10,
    backgroundColor: "#e6f3ff",
    padding: 10,
    borderRadius: 6,
  },
  verifyBtn: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});
