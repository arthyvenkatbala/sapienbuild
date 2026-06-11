"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Lead, KanbanStage, KANBAN_STAGES, STAGE_META } from "@/lib/leads-data";
import LeadCard from "./LeadCard";

interface Props {
  leads:        Lead[];
  onSelectLead: (lead: Lead) => void;
  onMoveLead:   (leadId: string, stage: KanbanStage) => void;
}

function KanbanColumn({
  stage,
  leads,
  draggingId,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onSelectLead,
}: {
  stage:        KanbanStage;
  leads:        Lead[];
  draggingId:   string | null;
  isDragOver:   boolean;
  onDragOver:   (e: React.DragEvent) => void;
  onDragLeave:  () => void;
  onDrop:       (e: React.DragEvent) => void;
  onDragStart:  (id: string) => void;
  onDragEnd:    () => void;
  onSelectLead: (lead: Lead) => void;
}) {
  const meta = STAGE_META[stage];

  return (
    <div
      className="flex flex-col flex-shrink-0 w-[272px]"
      onDragOver={(e) => { e.preventDefault(); onDragOver(e); }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Sticky column header */}
      <div
        className={`sticky top-0 z-10 flex items-center justify-between px-3 py-2.5 rounded-xl mb-2 border transition-all ${
          isDragOver ? "border-opacity-80" : ""
        }`}
        style={{
          background:  isDragOver ? `${meta.hex}14` : `${meta.hex}0a`,
          borderColor: isDragOver ? `${meta.hex}60` : `${meta.hex}30`,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: meta.hex, boxShadow: `0 0 6px ${meta.hex}80` }}
          />
          <span className="text-xs font-semibold text-white">{stage}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${meta.hex}20`, color: meta.hex }}
          >
            {leads.length}
          </span>
        </div>
      </div>

      {/* Drop zone indicator */}
      {isDragOver && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0.8 }}
          animate={{ opacity: 1, scaleY: 1 }}
          className="mb-2 h-1 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${meta.hex}, transparent)` }}
        />
      )}

      {/* Cards */}
      <div className="flex flex-col gap-2 min-h-[120px]">
        <AnimatePresence>
          {leads.map((lead) => (
            <div
              key={lead.id}
              draggable
              onDragStart={() => onDragStart(lead.id)}
              onDragEnd={onDragEnd}
              className={`transition-all duration-150 ${
                draggingId === lead.id ? "opacity-40 scale-95 rotate-1" : ""
              }`}
            >
              <LeadCard lead={lead} onSelect={() => onSelectLead(lead)} />
            </div>
          ))}
        </AnimatePresence>

        {leads.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center h-24 rounded-xl border border-dashed transition-all ${
              isDragOver ? "border-opacity-60 bg-opacity-10" : "border-white/[0.06]"
            }`}
            style={isDragOver ? { borderColor: `${meta.hex}60`, background: `${meta.hex}08` } : {}}
          >
            <p className="text-[10px] text-zinc-700">
              {isDragOver ? "Drop here" : "No leads"}
            </p>
          </div>
        )}
      </div>

      {/* Add lead button */}
      <button className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.05] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.1] transition-all text-xs w-full">
        <Plus size={12} /> Add lead
      </button>
    </div>
  );
}

export default function LeadKanban({ leads, onSelectLead, onMoveLead }: Props) {
  const [draggingId,   setDraggingId]   = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<KanbanStage | null>(null);

  const leadsByStage = useMemo(() => {
    const map: Record<KanbanStage, Lead[]> = {} as Record<KanbanStage, Lead[]>;
    KANBAN_STAGES.forEach((s) => { map[s] = []; });
    leads.forEach((l) => { map[l.stage]?.push(l); });
    return map;
  }, [leads]);

  const handleDrop = (stage: KanbanStage) => (e: React.DragEvent) => {
    e.preventDefault();
    if (draggingId && draggingId !== "") {
      onMoveLead(draggingId, stage);
    }
    setDraggingId(null);
    setDragOverStage(null);
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max px-1 pb-1">
        {KANBAN_STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={leadsByStage[stage]}
            draggingId={draggingId}
            isDragOver={dragOverStage === stage && draggingId !== null}
            onDragOver={() => setDragOverStage(stage)}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={handleDrop(stage)}
            onDragStart={(id) => setDraggingId(id)}
            onDragEnd={() => { setDraggingId(null); setDragOverStage(null); }}
            onSelectLead={onSelectLead}
          />
        ))}
      </div>
    </div>
  );
}
