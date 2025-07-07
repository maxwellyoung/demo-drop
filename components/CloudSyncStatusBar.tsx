"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  CloudOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  Download,
  RotateCcw,
} from "lucide-react";

interface SyncStats {
  total: number;
  synced: number;
  pending: number;
  failed: number;
  lastSync?: number;
}

interface CloudSyncStatusBarProps {
  className?: string;
  compact?: boolean;
}

export default function CloudSyncStatusBar({
  className = "",
  compact = false,
}: CloudSyncStatusBarProps) {
  const [syncStats, setSyncStats] = useState<SyncStats>({
    total: 0,
    synced: 0,
    pending: 0,
    failed: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Load sync stats
  const loadSyncStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/sync");
      const data = await response.json();
      setSyncStats(
        data.summary || {
          total: 0,
          synced: 0,
          pending: 0,
          failed: 0,
        }
      );
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to load sync stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start sync
  const startSync = async () => {
    setIsSyncing(true);
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceSync: false }),
      });
      await loadSyncStats();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadSyncStats();
    const interval = setInterval(loadSyncStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Determine overall sync status
  const getSyncStatus = () => {
    if (isSyncing) return { status: "syncing", color: "blue", icon: Loader2 };
    if (syncStats.failed > 0)
      return { status: "error", color: "red", icon: AlertCircle };
    if (syncStats.pending > 0)
      return { status: "pending", color: "yellow", icon: Upload };
    if (syncStats.total > 0)
      return { status: "synced", color: "green", icon: CheckCircle };
    return { status: "empty", color: "gray", icon: CloudOff };
  };

  const statusInfo = getSyncStatus();
  const IconComponent = statusInfo.icon;

  if (syncStats.total === 0 && !isLoading) {
    return null; // Don't show if no tracks
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`compact-sync-indicator ${className}`}
      >
        <div
          className={`sync-badge sync-badge-${statusInfo.color}`}
          title={`${syncStats.synced}/${syncStats.total} tracks synced`}
        >
          <IconComponent
            className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
          />
          <span className="sync-count">
            {syncStats.synced}/{syncStats.total}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`cloud-sync-status-bar ${className}`}
    >
      <div className="sync-status-content md:flex-row flex-col">
        {/* Status Icon & Text */}
        <div className="sync-status-main">
          <div className={`sync-icon sync-icon-${statusInfo.color}`}>
            <IconComponent
              className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`}
            />
          </div>

          <div className="sync-text">
            <h3 className="sync-title">
              {statusInfo.status === "syncing" && "Syncing to cloud..."}
              {statusInfo.status === "synced" && "All tracks synced"}
              {statusInfo.status === "pending" &&
                `${syncStats.pending} tracks pending`}
              {statusInfo.status === "error" &&
                `${syncStats.failed} sync errors`}
              {statusInfo.status === "empty" && "No tracks to sync"}
            </h3>

            {lastUpdate && (
              <p className="sync-subtitle">
                Last updated {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {syncStats.total > 0 && (
          <div className="sync-progress w-full order-last md:order-none">
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{
                  width: `${(syncStats.synced / syncStats.total) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="progress-text hidden sm:inline">
              {syncStats.synced} of {syncStats.total} synced
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="sync-actions w-full md:w-auto justify-end">
          {syncStats.pending > 0 && !isSyncing && (
            <button
              onClick={startSync}
              className="sync-button sync-button-primary"
            >
              <Upload className="w-4 h-4" />
              Sync Now
            </button>
          )}

          <button
            onClick={loadSyncStats}
            disabled={isLoading || isSyncing}
            className="sync-button sync-button-secondary"
          >
            <RotateCcw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <AnimatePresence>
        {(syncStats.pending > 0 || syncStats.failed > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sync-details"
          >
            <div className="sync-stats">
              {syncStats.synced > 0 && (
                <div className="stat-item stat-success">
                  <CheckCircle className="w-4 h-4" />
                  <span>{syncStats.synced} synced</span>
                </div>
              )}
              {syncStats.pending > 0 && (
                <div className="stat-item stat-warning">
                  <Upload className="w-4 h-4" />
                  <span>{syncStats.pending} pending</span>
                </div>
              )}
              {syncStats.failed > 0 && (
                <div className="stat-item stat-error">
                  <AlertCircle className="w-4 h-4" />
                  <span>{syncStats.failed} failed</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
