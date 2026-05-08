import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { downloadResource } from "@/data/homework/homeworkService";

interface LearningResourceCardProps {
  id: number;
  title: string;
  description?: string;
  resourceType: "pdf" | "ppt" | "video" | "link" | "document";
  category: "textbook" | "reference" | "solved_problems" | "notes" | "practice";
  externalLink?: string;
  fileSize?: number;
  uploadedById?: number;
  onDownloadSuccess?: (filename: string) => void;
}

const LearningResourceCard = ({
  id,
  title,
  description,
  resourceType,
  category,
  externalLink,
  fileSize,
  uploadedById,
  onDownloadSuccess,
}: LearningResourceCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Get icon for resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "document-outline";
      case "ppt":
        return "easel-outline";
      case "video":
        return "play-circle-outline";
      case "link":
        return "link-outline";
      case "document":
        return "document-text-outline";
      default:
        return "document-outline";
    }
  };

  // Get color for category
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "textbook":
        return "#E91E63"; // Pink
      case "reference":
        return "#2196F3"; // Blue
      case "solved_problems":
        return "#4CAF50"; // Green
      case "notes":
        return "#FF9800"; // Orange
      case "practice":
        return "#9C27B0"; // Purple
      default:
        return "#808080"; // Gray
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Handle download
  const handleDownload = async () => {
    if (resourceType === "link" && externalLink) {
      // Open link in browser
      try {
        await Linking.openURL(externalLink);
      } catch (error) {
        Alert.alert("Error", "Unable to open link");
      }
      return;
    }

    setIsDownloading(true);
    try {
      const fileBlob = await downloadResource(id);
      // In a real app, you would save this to device storage
      Alert.alert("Success", "File downloaded successfully");
      onDownloadSuccess?.(title);
    } catch (error) {
      Alert.alert("Error", "Failed to download file");
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header with Icon and Title */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getResourceIcon(resourceType)}
            size={28}
            color="#666"
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.metaContainer}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(category) },
              ]}
            >
              <Text style={styles.categoryText}>{category.replace(/_/g, " ")}</Text>
            </View>
            <Text style={styles.resourceType}>{resourceType.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      {description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        </View>
      )}

      {/* File Info */}
      {fileSize && resourceType !== "link" && (
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="document-outline" size={14} color="#999" />
            <Text style={styles.infoText}>{formatFileSize(fileSize)}</Text>
          </View>
        </View>
      )}

      {/* External Link Info */}
      {externalLink && resourceType === "link" && (
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="link-outline" size={14} color="#2196F3" />
            <Text style={[styles.infoText, { color: "#2196F3" }]}>
              External Link
            </Text>
          </View>
        </View>
      )}

      {/* Download Button */}
      <TouchableOpacity
        style={[
          styles.downloadButton,
          isDownloading && styles.downloadButtonDisabled,
        ]}
        onPress={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.downloadButtonText}>Downloading...</Text>
          </>
        ) : (
          <>
            <Ionicons
              name={resourceType === "link" ? "open-outline" : "download-outline"}
              size={18}
              color="#fff"
            />
            <Text style={styles.downloadButtonText}>
              {resourceType === "link" ? "Open Link" : "Download"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LearningResourceCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  resourceType: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
  },
  descriptionContainer: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  description: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 6,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#2196F3",
    borderRadius: 8,
  },
  downloadButtonDisabled: {
    backgroundColor: "#90CAF9",
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
