import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Tag, Clock, Star, Folder } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  type: "smart" | "manual";
  filter: string;
  color: string;
  count: number;
}

interface SmartCollectionsProps {
  collections: Collection[];
  activeCollection: string | null;
  onCollectionSelect: (collectionId: string | null) => void;
  onCreateCollection: (name: string, filter: string, color: string) => void;
  onDeleteCollection: (collectionId: string) => void;
}

const PRESET_COLLECTIONS = [
  {
    id: "recent",
    name: "Recent",
    type: "smart" as const,
    filter: "created:<7d",
    color: "#3b82f6",
    icon: Clock,
  },
  {
    id: "favorites",
    name: "Favorites",
    type: "smart" as const,
    filter: "reactions.fire:>0",
    color: "#f59e0b",
    icon: Star,
  },
  {
    id: "drafts",
    name: "Drafts",
    type: "smart" as const,
    filter: "status:draft",
    color: "#6b7280",
    icon: Folder,
  },
  {
    id: "mixes",
    name: "Mixes",
    type: "smart" as const,
    filter: "tag:mix",
    color: "#8b5cf6",
    icon: Tag,
  },
];

const COLOR_OPTIONS = [
  "#3b82f6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

export default function SmartCollections({
  collections,
  activeCollection,
  onCollectionSelect,
  onCreateCollection,
  onDeleteCollection,
}: SmartCollectionsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionFilter, setNewCollectionFilter] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateCollection = () => {
    if (newCollectionName.trim() && newCollectionFilter.trim()) {
      onCreateCollection(
        newCollectionName.trim(),
        newCollectionFilter.trim(),
        selectedColor
      );
      setNewCollectionName("");
      setNewCollectionFilter("");
      setSelectedColor(COLOR_OPTIONS[0]);
      setShowCreateForm(false);
    }
  };

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="smart-collections bg-gray-50 border-r border-gray-200 w-64 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Collections
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Create button */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collections list */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Preset collections */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
            Quick Filters
          </h3>
          {PRESET_COLLECTIONS.map((preset) => {
            const Icon = preset.icon;
            const isActive = activeCollection === preset.id;
            const collection = collections.find((c) => c.id === preset.id);

            return (
              <motion.button
                key={preset.id}
                onClick={() => onCollectionSelect(isActive ? null : preset.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-indigo-100 text-indigo-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: preset.color }}
                />
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium flex-1">
                  {preset.name}
                </span>
                {collection && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {collection.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Custom collections */}
        {filteredCollections.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
              Custom Collections
            </h3>
            {filteredCollections.map((collection) => {
              const isActive = activeCollection === collection.id;

              return (
                <div key={collection.id} className="relative group">
                  <button
                    onClick={() =>
                      onCollectionSelect(isActive ? null : collection.id)
                    }
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: collection.color }}
                    />
                    <Tag className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium flex-1">
                      {collection.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                      {collection.count}
                    </span>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCollection(collection.id);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create collection modal */}
      {showCreateForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">
              Create New Collection
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Client Mixes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Query
                </label>
                <input
                  type="text"
                  value={newCollectionFilter}
                  onChange={(e) => setNewCollectionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., tag:client OR artist:John"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use filters like: tag:mix, status:draft, created:&lt;30d
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex space-x-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-gray-900 scale-110"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={
                  !newCollectionName.trim() || !newCollectionFilter.trim()
                }
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
