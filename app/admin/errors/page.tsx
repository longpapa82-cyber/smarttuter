'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface ErrorRecord {
  id: string;
  fingerprint: string;
  message: string;
  stack: string;
  name: string;
  timestamp: number;
  severity: 'critical' | 'error' | 'warning' | 'info';
  userId?: string;
  sessionId: string;
  path: string;
  method: string;
  userAgent: string;
  routePath: string;
  routeType: string;
  renderSource: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
  notes?: string;
}

interface ErrorStats {
  total: number;
  resolved: number;
  unresolved: number;
  bySeverity: {
    critical: number;
    error: number;
    warning: number;
    info: number;
  };
  byRoute: Record<string, number>;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
}

export default function AdminErrorsPage() {
  const [errors, setErrors] = useState<ErrorRecord[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedResolved, setSelectedResolved] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedError, setSelectedError] = useState<ErrorRecord | null>(null);

  // Fetch errors and stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const [errorsRes, statsRes] = await Promise.all([
        fetch('/api/admin/errors'),
        fetch('/api/admin/errors/stats'),
      ]);

      const errorsData = await errorsRes.json();
      const statsData = await statsRes.json();

      if (errorsData.success) {
        setErrors(errorsData.errors);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter errors
  const filteredErrors = errors.filter((error) => {
    const matchesSeverity = selectedSeverity === 'all' || error.severity === selectedSeverity;
    const matchesResolved = selectedResolved === 'all' ||
      (selectedResolved === 'resolved' && error.resolved) ||
      (selectedResolved === 'unresolved' && !error.resolved);
    const matchesSearch = searchQuery === '' ||
      error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.routePath.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSeverity && matchesResolved && matchesSearch;
  });

  // Delete error
  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 에러를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/admin/errors/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to delete error:', error);
    }
  };

  // Toggle resolve status
  const handleResolve = async (id: string, resolved: boolean) => {
    try {
      const res = await fetch(`/api/admin/errors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolved,
          resolvedBy: 'admin',
          notes: resolved ? 'Resolved via admin dashboard' : undefined
        }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to update error:', error);
    }
  };

  // Severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  // Severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'error':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  // Format relative time
  const formatRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}초 전`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">에러 추적 대시보드</h1>
          <p className="text-gray-600">시스템에서 발생한 모든 에러를 추적하고 관리합니다</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">전체 에러</h3>
                <AlertCircle className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500 mt-1">총 에러 수</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">미해결</h3>
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-orange-600">{stats.unresolved}</p>
              <p className="text-sm text-gray-500 mt-1">처리 필요</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">해결됨</h3>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
              <p className="text-sm text-gray-500 mt-1">처리 완료</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">24시간</h3>
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.last24Hours}</p>
              <p className="text-sm text-gray-500 mt-1">최근 24시간</p>
            </div>
          </div>
        )}

        {/* Severity Statistics */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">심각도별 통계</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Critical</p>
                  <p className="text-xl font-bold text-gray-900">{stats.bySeverity.critical}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Error</p>
                  <p className="text-xl font-bold text-gray-900">{stats.bySeverity.error}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Warning</p>
                  <p className="text-xl font-bold text-gray-900">{stats.bySeverity.warning}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Info</p>
                  <p className="text-xl font-bold text-gray-900">{stats.bySeverity.info}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="에러 메시지 또는 경로로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">모든 심각도</option>
                <option value="critical">Critical</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>

            {/* Resolved Filter */}
            <div>
              <select
                value={selectedResolved}
                onChange={(e) => setSelectedResolved(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                <option value="unresolved">미해결</option>
                <option value="resolved">해결됨</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </div>

        {/* Error List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    심각도
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    에러 메시지
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    경로
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    발생 횟수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마지막 발생
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : filteredErrors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      에러가 없습니다
                    </td>
                  </tr>
                ) : (
                  filteredErrors.map((error) => (
                    <tr
                      key={error.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedError(error)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(error.severity)}
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(error.severity)}`}>
                            {error.severity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-md" title={error.message}>
                          {error.name}: {error.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{error.routePath}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                          {error.count}회
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatRelativeTime(error.lastSeen)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {error.resolved ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded border border-green-300">
                            해결됨
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded border border-orange-300">
                            미해결
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(error.id, !error.resolved);
                            }}
                            className={`p-1 rounded hover:bg-gray-100 ${
                              error.resolved ? 'text-orange-600' : 'text-green-600'
                            }`}
                            title={error.resolved ? '미해결로 변경' : '해결됨으로 변경'}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(error.id);
                            }}
                            className="p-1 rounded hover:bg-gray-100 text-red-600"
                            title="삭제"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Error Detail Modal */}
        {selectedError && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedError(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">에러 상세 정보</h2>
                  <button
                    onClick={() => setSelectedError(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Error Header */}
                  <div className="flex items-start gap-4">
                    {getSeverityIcon(selectedError.severity)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{selectedError.name}</h3>
                      <p className="text-gray-600 mt-1">{selectedError.message}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded border ${getSeverityColor(selectedError.severity)}`}>
                      {selectedError.severity}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">경로</p>
                      <p className="text-sm font-medium text-gray-900">{selectedError.routePath}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">메서드</p>
                      <p className="text-sm font-medium text-gray-900">{selectedError.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">발생 횟수</p>
                      <p className="text-sm font-medium text-gray-900">{selectedError.count}회</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">세션 ID</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedError.sessionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">처음 발생</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedError.firstSeen)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">마지막 발생</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedError.lastSeen)}</p>
                    </div>
                  </div>

                  {/* Stack Trace */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Stack Trace</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                      {selectedError.stack}
                    </pre>
                  </div>

                  {/* User Agent */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">User Agent</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedError.userAgent}</p>
                  </div>

                  {/* Resolution Status */}
                  {selectedError.resolved && selectedError.resolvedAt && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-900 mb-2">해결 정보</h4>
                      <div className="text-sm text-green-800">
                        <p>해결 시간: {formatDate(selectedError.resolvedAt)}</p>
                        <p>해결자: {selectedError.resolvedBy}</p>
                        {selectedError.notes && <p>메모: {selectedError.notes}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
