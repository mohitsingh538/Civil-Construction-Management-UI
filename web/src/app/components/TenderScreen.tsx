import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, FileText, MapPin, Calendar, IndianRupee, Paperclip, Filter, Download, Sparkles, Upload, ChevronDown } from 'lucide-react';
import BottomNavbar from './BottomNavbar';
import Modal from './Modal';
import AnimatedPressable from './ui/AnimatedPressable';
import NeumorphicSelect from './ui/NeumorphicSelect';
import { getTenderStatusBadge, filterTenders, getTenderCounts, generateTenderSummary } from '@core/services/tenderService';
import { useTenders } from '@/hooks';

export default function TenderScreen() {
  const navigate = useNavigate();
  const { data: tenders, isLoading, error } = useTenders();
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTender, setSelectedTender] = useState<any>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const getStatusBadge = getTenderStatusBadge;
  const filteredTenders = filterTenders(tenders ?? [], filterStatus);
  const { open: openCount, upcoming: upcomingCount, closed: closedCount } = getTenderCounts(tenders ?? []);

  const generateAISummary = (tender: any) => {
    setAiSummary(generateTenderSummary(tender));
    setShowAISummary(true);
  };

  if (isLoading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-[#9CA3AF]">Loading...</span></div>;
  if (error) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-red-400">Error loading tenders</span></div>;

  return (
    <div className="h-[var(--app-height)] bg-[#0F1117] flex flex-col">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-[#16161F] border-b border-white/[0.07]"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4 mb-4">
            <AnimatedPressable
              onClick={() => navigate(-1)}
              className="p-2.5 bg-[#1E1E2E] rounded-xl"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
              <ArrowLeft className="w-5 h-5 text-[#9CA3AF]" />
            </AnimatedPressable>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#141420] rounded-xl flex items-center justify-center"
                style={{
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.2)',
                }}>
                <FileText className="w-6 h-6 text-[#8B5CF6]" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Tender Management</h1>
                <p className="text-sm text-[#9CA3AF] font-medium">Browse & Submit Bids</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <NeumorphicSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'all', label: 'All Tenders' },
                { value: 'open', label: 'Open for Bidding' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'closed', label: 'Closed' },
              ]}
              className="flex-1"
            />
            <AnimatedPressable className="p-2 bg-[#1E1E2E] rounded-xl flex items-center justify-center text-[#9CA3AF]"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
              <Filter className="w-5 h-5" />
            </AnimatedPressable>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain w-full relative z-10 max-w-7xl mx-auto px-6 py-8" style={{ paddingBottom: 'calc(132px + env(safe-area-inset-bottom))' }}>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Total Tenders', value: tenders.length, color: '#9CA3AF' },
            { label: 'Open', value: openCount, color: '#10B981' },
            { label: 'Upcoming', value: upcomingCount, color: '#3B82F6' },
            { label: 'Closed', value: closedCount, color: '#6B7280' },
          ].map((stat, i) => (
            <div key={i} className="relative bg-[#1E1E2E] rounded-[20px] p-5"
              style={{
                boxShadow: '0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.06), transparent 50%)',
                }}
              />

              <div className="relative">
                <div className="text-sm text-[#9CA3AF] font-semibold mb-1">{stat.label}</div>
                <div className="text-3xl font-bold tracking-tight"
                  style={{
                    color: stat.color,
                    textShadow: `0 0 20px ${stat.color}60`,
                  }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tenders List */}
        <div className="space-y-5">
          {filteredTenders.map((tender, index) => {
            const statusBadge = getStatusBadge(tender.status);
            const daysRemaining = tender.status === 'open'
              ? Math.ceil((new Date(tender.closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={tender.id}
                className="group relative bg-[#1E1E2E] rounded-[20px] p-6 transition-all duration-300 hover:bg-[#252532]"
                style={{
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}>
                <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.04), transparent 55%)',
                  }}
                />

                <div className="relative">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="font-bold text-white text-lg tracking-tight">{tender.title}</h3>
                        {index === 0 && (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-[#F59E0B]/10"
                            style={{
                              color: '#F59E0B',
                              boxShadow: 'inset 0 1px 3px rgba(245,158,11,0.3), 0 0 0 1px rgba(245,158,11,0.3)',
                            }}>
                            ✦ Latest
                          </span>
                        )}
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold ${statusBadge.bgColor}`}
                          style={{
                            color: statusBadge.color,
                            boxShadow: `inset 0 1px 3px ${statusBadge.color}33, 0 0 0 1px ${statusBadge.color}33`,
                          }}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7280] mb-2">Tender No: {tender.tenderNumber}</p>
                      <p className="text-sm text-[#9CA3AF] font-medium leading-relaxed">{tender.description}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-[#6B7280] mb-1">Estimated Value</div>
                        <div className="text-2xl font-bold text-[#8B5CF6]"
                          style={{
                            textShadow: '0 0 20px rgba(139,92,246,0.4)',
                          }}>
                          ₹{(tender.estimatedValue / 10000000).toFixed(1)}Cr
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-[#141420]">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
                      <span className="text-[#9CA3AF] font-medium truncate">{tender.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
                      <span className="text-[#9CA3AF] font-medium">Closes: {new Date(tender.closingDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    {tender.highestBid && (
                      <div className="flex items-center gap-2 text-sm">
                        <IndianRupee className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                        <span className="text-[#9CA3AF] font-medium">Highest: ₹{(tender.highestBid / 10000000).toFixed(2)}Cr</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
                      <span className="text-[#9CA3AF] font-medium">{tender.totalBids} bids received</span>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Paperclip className="w-4 h-4 text-[#8B5CF6]" />
                      <span className="text-sm font-bold text-white">Attachments ({tender.attachments.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tender.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-[#141420] rounded-xl"
                          style={{
                            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
                          }}>
                          <FileText className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-white truncate">{file.name}</div>
                            <div className="text-xs text-[#6B7280]">{file.size}</div>
                          </div>
                          <Download className="w-4 h-4 text-[#9CA3AF] hover:text-white cursor-pointer flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <AnimatedPressable
                      onClick={() => {
                        setSelectedTender(tender);
                        generateAISummary(tender);
                      }}
                      className="flex-1 px-4 py-2.5 bg-[#141420] rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                      style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                      }}>
                      <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                      <span className="hidden sm:inline">AI Summary</span>
                      <span className="sm:hidden">AI</span>
                    </AnimatedPressable>

                    {tender.status === 'open' && (
                      <>
                        <AnimatedPressable className="flex-1 px-4 py-2.5 bg-[#141420] rounded-xl text-[#9CA3AF] font-semibold flex items-center justify-center gap-2"
                          style={{
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                          }}>
                          <Download className="w-4 h-4 flex-shrink-0" />
                          <span className="hidden sm:inline">Download Documents</span>
                          <span className="sm:hidden">Download</span>
                        </AnimatedPressable>
                        <AnimatedPressable
                          onClick={() => {
                            setSelectedTender(tender);
                            setShowBidModal(true);
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                          style={{
                            background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                            boxShadow: '0 8px 24px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                          }}>
                          <Upload className="w-4 h-4 flex-shrink-0" />
                          {daysRemaining && daysRemaining <= 7 && (
                            <span className="hidden sm:inline">Place Bid ({daysRemaining}d left)</span>
                          )}
                          {(!daysRemaining || daysRemaining > 7) && (
                            <span className="hidden sm:inline">Place Bid</span>
                          )}
                          <span className="sm:hidden">Bid</span>
                        </AnimatedPressable>
                      </>
                    )}

                    {tender.status === 'upcoming' && (
                      <AnimatedPressable className="flex-1 px-4 py-2.5 bg-[#141420] rounded-xl text-[#9CA3AF] font-semibold flex items-center justify-center gap-2"
                        style={{
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                        }}>
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Set Reminder</span>
                        <span className="sm:hidden">Remind</span>
                      </AnimatedPressable>
                    )}

                    {tender.status === 'closed' && (
                      <AnimatedPressable className="flex-1 px-4 py-2.5 bg-[#141420] rounded-xl text-[#9CA3AF] font-semibold flex items-center justify-center gap-2"
                        style={{
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                        }}>
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">View Results</span>
                        <span className="sm:hidden">Results</span>
                      </AnimatedPressable>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Summary Modal */}
      <Modal
        open={!!(showAISummary && selectedTender)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#141420] rounded-xl flex items-center justify-center"
              style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.2)' }}>
              <Sparkles className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <span>AI-Powered Tender Analysis</span>
          </div>
        }
        subtitle={selectedTender?.tenderNumber}
        maxWidth="max-w-2xl"
        onClose={() => { setShowAISummary(false); setSelectedTender(null); }}
      >
        {selectedTender && (
          <>
            <div className="bg-[#141420] rounded-xl p-5 mt-5 mb-5 whitespace-pre-line"
              style={{
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
              }}>
              <p className="text-[#E5E7EB] leading-relaxed font-medium">{aiSummary}</p>
            </div>

            <div className="flex gap-3">
              <AnimatedPressable
                onClick={() => {
                  setShowAISummary(false);
                  setSelectedTender(null);
                }}
                className="flex-1 px-4 py-2.5 bg-[#141420] rounded-xl text-[#9CA3AF] font-medium"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)' }}
              >
                Close
              </AnimatedPressable>
              {selectedTender.status === 'open' && (
                <AnimatedPressable
                  onClick={() => {
                    setShowAISummary(false);
                    setShowBidModal(true);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                    boxShadow: '0 8px 24px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
                  Proceed to Bid
                </AnimatedPressable>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Place Bid Modal */}
      <Modal
        open={!!(showBidModal && selectedTender)}
        title="Submit Bid"
        maxWidth="max-w-md"
        onClose={() => { setShowBidModal(false); setSelectedTender(null); }}
      >
        {selectedTender && (
          <>
            <div className="bg-[#141420] rounded-xl p-4 mt-5 mb-5"
                style={{
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.2)',
                }}>
                <div className="font-bold text-white mb-1">{selectedTender.title}</div>
                <div className="text-sm text-[#9CA3AF]">Tender No: {selectedTender.tenderNumber}</div>
                <div className="text-sm text-[#9CA3AF] mt-2">
                  Estimated: ₹{(selectedTender.estimatedValue / 10000000).toFixed(2)}Cr
                </div>
                {selectedTender.highestBid && (
                  <div className="text-sm text-[#10B981] mt-1">
                    Current Highest: ₹{(selectedTender.highestBid / 10000000).toFixed(2)}Cr
                  </div>
                )}
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Your Bid Amount (₹ Crores)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    placeholder="Enter bid amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Completion Timeline (Months)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    placeholder="Estimated completion time"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Upload Bid Documents</label>
                  <div className="flex items-center justify-center w-full px-4 py-8 bg-[#141420] rounded-xl border-2 border-dashed border-[#6B7280] hover:border-[#8B5CF6] transition cursor-pointer"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
                    }}>
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-[#8B5CF6] mx-auto mb-2" />
                      <p className="text-sm text-[#9CA3AF] font-medium">Click to upload documents</p>
                      <p className="text-xs text-[#6B7280] mt-1">PDF, DOCX up to 50MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Additional Notes</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    placeholder="Any special terms or conditions..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <AnimatedPressable
                    type="button"
                    onClick={() => {
                      setShowBidModal(false);
                      setSelectedTender(null);
                    }}
                    className="flex-1 px-4 py-2.5 bg-[#141420] rounded-xl text-[#9CA3AF] font-medium"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                  >
                    Cancel
                  </AnimatedPressable>
                  <AnimatedPressable
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl text-white font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                      boxShadow: '0 8px 24px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    Submit Bid
                  </AnimatedPressable>
                </div>
              </form>
          </>
        )}
      </Modal>

      <BottomNavbar />
    </div>
  );
}
