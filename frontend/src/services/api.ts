import axios from "axios";
import type {
  ScanDetail,
  ScanHistoryResponse,
  DashboardStatistics,
  ThreatIntelProvider,
  IOCLookupResponse,
} from "../types/scan";

const API_BASE = "/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export interface PasteScanPayload {
  from_address: string;
  to_address?: string;
  reply_to?: string;
  subject: string;
  body: string;
  raw_headers?: string;
}

export const ScanService = {
  async getHealth(): Promise<{ status: string; ml_model_loaded: boolean }> {
    const res = await api.get("/health");
    return res.data;
  },

  async scanPasted(payload: PasteScanPayload): Promise<ScanDetail> {
    const res = await api.post<ScanDetail>("/scans", payload);
    return res.data;
  },

  async uploadEml(file: File): Promise<ScanDetail> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<ScanDetail>("/scans/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async getScan(id: string): Promise<ScanDetail> {
    const res = await api.get<ScanDetail>(`/scans/${id}`);
    return res.data;
  },

  async getScans(limit = 20, offset = 0, severity?: string): Promise<ScanHistoryResponse> {
    const params: Record<string, any> = { limit, offset };
    if (severity && severity !== "ALL") {
      params.severity = severity;
    }
    const res = await api.get<ScanHistoryResponse>("/scans", { params });
    return res.data;
  },

  async deleteScan(id: string): Promise<{ success: boolean }> {
    const res = await api.delete(`/scans/${id}`);
    return res.data;
  },

  async getStatistics(): Promise<DashboardStatistics> {
    const res = await api.get<DashboardStatistics>("/statistics");
    return res.data;
  },

  async getThreatIntelStatus(): Promise<{ providers: ThreatIntelProvider[] }> {
    const res = await api.get("/threat-intel/status");
    return res.data;
  },

  async lookupIOC(type: string, value: string): Promise<IOCLookupResponse> {
    const res = await api.post<IOCLookupResponse>("/threat-intel/lookup", { type, value });
    return res.data;
  },
};
